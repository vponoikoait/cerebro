package models.analysis

import play.api.libs.json._

object IndexFields {

  private final val AnalyzableFields = Seq("text")

  private final def analyzable(fieldType: String) =
    AnalyzableFields.contains(fieldType)

  def apply(index: String, data: JsValue) = {
    // ES 7.x: typeless mappings — properties are directly under "mappings"
    val fields = extractProperties((data \ index \ "mappings" \ "properties").as[JsValue])
    JsArray(fields.map(JsString))
  }

  def extractProperties(data: JsValue): Seq[String] = {
    data match {
      case obj: JsObject =>
        obj.keys.collect {
          case p if (data \ p \ "properties").asOpt[JsObject].isDefined =>
            extractProperties((data \ p \ "properties").as[JsValue]).map(s"$p.".concat(_))

          case p if (data \ p \ "fields").asOpt[JsObject].isDefined =>
            val fields = (data \ p \ "fields").as[JsObject].keys.collect {
              case field if (data \ p \ "fields" \ field \ "type").asOpt[String].exists(analyzable) =>
                s"$p.$field"
            }.toSeq
            if ((data \ p \ "type").asOpt[String].exists(analyzable)) {
              fields :+ p
            } else {
              fields
            }

          case p if (data \ p \ "type").asOpt[String].exists(analyzable) =>
            Seq(p)
        }.flatten.toSeq
      case _ => Seq()
    }
  }

}
