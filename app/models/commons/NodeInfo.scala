package models.commons

import play.api.libs.json.{JsObject, JsValue, Json}

trait NodeInfo {

  private val InternalNodeAttributes = Seq(
    "ml.machine_memory",
    "ml.max_jvm_size",
    "ml.config_version",
    "ml.allocated_processors",
    "ml.max_open_jobs",
    "xpack.installed",
    "transform.node"
  )

  def attrs(info: JsValue) = {
    val map =
      (info \ "attributes").asOpt[JsObject].map(_.value.filterNot {
        case (attr, _) => InternalNodeAttributes.contains(attr)
      }).getOrElse(Map())

    JsObject(map.toSeq)
  }

}
