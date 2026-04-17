package models.commons

import play.api.libs.json.{JsArray, JsString, JsValue}

case class NodeRoles(master: Boolean, data: Boolean, ingest: Boolean) {

  def coordinating: Boolean = !master && !data && !ingest

}

object NodeRoles {

  // All data-tier roles in ES 7.x (data_frozen added in 7.12)
  private val DataRoles = Seq(
    "data", "data_content", "data_hot", "data_warm", "data_cold", "data_frozen"
  ).map(JsString)

  def apply(nodeInfo: JsValue): NodeRoles = {
    val roles = (nodeInfo \ "roles").as[JsArray].value
    NodeRoles(
      master = roles.contains(JsString("master")),
      data   = roles.exists(role => DataRoles.contains(role)),
      ingest = roles.contains(JsString("ingest"))
    )
  }
}
