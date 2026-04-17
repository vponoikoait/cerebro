// Comment to get more information during initialization
logLevel := Level.Warn

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.8.22")

addSbtPlugin("com.typesafe.sbt" % "sbt-digest" % "1.1.4")

addSbtPlugin("com.typesafe.sbt" % "sbt-gzip" % "1.0.2")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.10.4")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.12.0")

libraryDependencies += "org.vafer" % "jdeb" % "1.10" artifacts (Artifact("jdeb", "jar", "jar"))

// Resolve scala-xml version conflict between sbt-native-packager and Play's twirl
ThisBuild / libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always
