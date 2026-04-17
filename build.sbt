name := "cerebro"

maintainer := "Leonardo Menezes <leonardo.menezes@xing.com>"

packageSummary := "Elasticsearch web admin tool"

packageDescription := """cerebro is an open source(MIT License) elasticsearch web admin tool built
  using Scala, Play Framework, AngularJS and Bootstrap."""

version := "0.9.5"

scalaVersion := "2.13.18"

rpmVendor := "lmenezes"

rpmLicense := Some("MIT")

rpmUrl := Some("http://github.com/lmenezes/cerebro")

libraryDependencies ++= Seq(
  "org.playframework" %% "play"                    % "3.0.10",
  "org.playframework" %% "play-json"               % "3.0.4",
  "org.playframework" %% "play-slick"              % "6.2.0",
  "org.playframework" %% "play-slick-evolutions"   % "6.2.0",
  "org.xerial"        %  "sqlite-jdbc"             % "3.46.1.0",
  "org.specs2"        %% "specs2-junit"  % "4.20.9" % "test",
  "org.specs2"        %% "specs2-core"   % "4.20.9" % "test",
  "org.specs2"        %% "specs2-mock"   % "4.20.9" % "test"
)

libraryDependencies += filters
libraryDependencies += ws
libraryDependencies += guice

lazy val root = (project in file(".")).
  enablePlugins(PlayScala, BuildInfoPlugin, LauncherJarPlugin, JDebPackaging, RpmPlugin).
  settings(
    buildInfoKeys := Seq[BuildInfoKey](name, version, scalaVersion, sbtVersion),
    buildInfoPackage := "models"
  )

Compile / doc / sources := Seq.empty

enablePlugins(JavaServerAppPackaging)
enablePlugins(SystemdPlugin)

pipelineStages := Seq(digest, gzip)

serverLoading := Some(ServerLoader.Systemd)
Debian / systemdSuccessExitStatus += "143"
Rpm / systemdSuccessExitStatus += "143"
linuxPackageMappings += packageTemplateMapping(s"/var/lib/${packageName.value}")() withUser (Linux / daemonUser).value withGroup (Linux / daemonGroup).value
