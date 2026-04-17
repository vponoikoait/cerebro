# =============================================================================
# Stage 1: Build frontend assets
# =============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy frontend source and build config
COPY Gruntfile.js ./
COPY conf/eslint.json conf/eslint.json
COPY src/ src/

# Build frontend (clean, lint, concat, copy)
RUN npx grunt clean concat copy

# =============================================================================
# Stage 2: Build backend (sbt compile + package)
# =============================================================================
FROM eclipse-temurin:11-jdk AS backend-builder

WORKDIR /build

# Install sbt
ARG SBT_VERSION=1.10.11
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" | \
    tar xz -C /usr/local && \
    ln -s /usr/local/sbt/bin/sbt /usr/local/bin/sbt && \
    rm -rf /var/lib/apt/lists/*

# Copy build definition files first for dependency caching
COPY build.sbt ./
COPY project/build.properties project/plugins.sbt project/

# Pre-fetch dependencies (this layer is cached unless build files change)
RUN sbt update

# Copy application source
COPY app/ app/
COPY conf/ conf/
COPY test/ test/

# Copy existing public assets (HTML templates, images, etc.)
COPY public/ public/

# Overlay frontend build output from stage 1 (compiled JS/CSS/fonts)
COPY --from=frontend-builder /build/public/ public/

# Compile and create distribution package
RUN sbt dist

# Extract the distribution zip
RUN unzip -q target/universal/cerebro-*.zip -d /opt && \
    mv /opt/cerebro-* /opt/cerebro

# =============================================================================
# Stage 3: Production runtime image
# =============================================================================
FROM eclipse-temurin:11-jre

LABEL maintainer="Leonardo Menezes <leonardo.menezes@xing.com>"
LABEL description="Cerebro - Elasticsearch web admin tool"
LABEL org.opencontainers.image.source="https://github.com/lmenezes/cerebro"

RUN groupadd -r cerebro && useradd -r -g cerebro cerebro

WORKDIR /opt/cerebro

COPY --from=backend-builder /opt/cerebro/ ./

# Create data directory for SQLite DB
RUN mkdir -p /opt/cerebro/data && \
    chown -R cerebro:cerebro /opt/cerebro

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Default configuration overrides for Docker
ENV CEREBRO_PORT=9000
ENV JAVA_OPTS="-Xms256m -Xmx512m -Ddata.path=/opt/cerebro/data/cerebro.db -Dpidfile.path=/dev/null"

USER cerebro

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsSL http://localhost:9000/ || exit 1

ENTRYPOINT ["bin/cerebro"]
CMD ["-Dhttp.port=9000", "-Dhttp.address=0.0.0.0"]
