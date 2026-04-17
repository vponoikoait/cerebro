package controllers

import javax.inject.Inject

import controllers.auth.AuthenticationModule
import elastic.{ElasticClient, Error, Success}
import models.commons.{Indices, Nodes}
import models.{CerebroResponse, Hosts}
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CommonsController @Inject()(val authentication: AuthenticationModule,
                                  val hosts: Hosts,
                                  client: ElasticClient) extends BaseController {

  def indices = process { request =>
    client.getIndices(request.target).map {
      case Success(status, indices) => CerebroResponse(status, Indices(indices))
      case Error(status, error) => CerebroResponse(status, error)
    }
  }

  def nodes = process { request =>
    client.getNodes(request.target).map {
      case Success(status, nodes) => CerebroResponse(status, Nodes(nodes))
      case Error(status, error) => CerebroResponse(status, error)
    }
  }

  def getIndexSettings = process { request =>
    client.getIndexSettings(request.get("index"), request.target) map { response =>
      CerebroResponse(response.status, response.body)
    }
  }

  def getIndexMappings = process { request =>
    client.getIndexMapping(request.get("index"), request.target) map { response =>
      CerebroResponse(response.status, response.body)
    }
  }

  def getNodeStats = process { request =>
    client.nodeStats(request.get("node"), request.target).map { response =>
      CerebroResponse(response.status, response.body)
    }
  }

  def getIndexStats = process { request =>
    client.indexStats(request.get("index"), request.target).map { response =>
      CerebroResponse(response.status, response.body)
    }
  }

  def getMappingDiff = process { request =>
    val indexA = request.get("indexA")
    val indexB = request.get("indexB")
    Future.sequence(Seq(
      client.getIndexMapping(indexA, request.target),
      client.getIndexMapping(indexB, request.target)
    )).map { responses =>
      val failed = responses.find(_.isInstanceOf[Error])
      failed match {
        case Some(f) => CerebroResponse(f.status, f.body)
        case None =>
          val mappingA = (responses(0).body \ indexA \ "mappings").asOpt[play.api.libs.json.JsValue].getOrElse(Json.obj())
          val mappingB = (responses(1).body \ indexB \ "mappings").asOpt[play.api.libs.json.JsValue].getOrElse(Json.obj())
          CerebroResponse(200, Json.obj(
            "indexA" -> Json.obj("name" -> indexA, "mappings" -> mappingA),
            "indexB" -> Json.obj("name" -> indexB, "mappings" -> mappingB)
          ))
      }
    }
  }

}
