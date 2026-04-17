name := "cerebro"

maintainer := "Leonardo Menezes <leonardo.menezes@xing.com>"

packageSummary := "Elasticsearch web admin tool"

packageDescription := """cerebro is an open source(MIT License) elasticsearch web admin tool built
  using Scala, Play Framework, AngularJS and Bootstrap."""

version := "0.9.5"

scalaVersion := "2.13.15"

rpmVendor := "lmenezes"

rpmLicense := Some("MIT")

rpmUrl := Some("http://github.com/lmenezes/cerebro")

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play"                    % "2.8.22",
  "com.typesafe.play" %% "play-json"               % "2.9.4",
  "com.typesafe.play" %% "play-slick"              % "5.1.0",
  "com.typesafe.play" %% "play-slick-evolutions"   % "5.1.0",
  "org.xerial"        %  "sqlite-jdbc"             % "3.46.1.0",
  "org.specs2"        %% "specs2-junit"  % "4.20.9" % "test",
  "org.specs2"        %% "specs2-core"   % "4.20.9" % "test",
  "org.specs2"        %% "specs2-mock"   % "4.20.9" % "test"
)

// Override transitive dependencies to fix known CVEs
// jackson-module-scala 2.11.4 (from Akka) enforces jackson-databind >= 2.11.0 and < 2.12.0
// so we pin to the latest 2.11.x patch. lz4-java can be upgraded independently.
dependencyOverrides ++= Seq(
  "com.fasterxml.jackson.core" % "jackson-core"        % "2.11.4",
  "com.fasterxml.jackson.core" % "jackson-databind"    % "2.11.4",
  "com.fasterxml.jackson.core" % "jackson-annotations" % "2.11.4",
  "org.lz4"                    % "lz4-java"            % "1.8.1"
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
