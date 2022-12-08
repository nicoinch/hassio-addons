ARG BUILD_FROM=ghcr.io/hassio-addons/base:12.2.6
FROM ${BUILD_FROM}

COPY rootfs /
RUN apk add --no-cache npm
WORKDIR /usr/src/app
# Copy data for add-on
COPY package.json .
COPY index.js .
COPY enedis-power-cut.js .
COPY enedis-api.js .
COPY run.sh /usr/src/app
RUN chmod a+x /usr/src/app/run.sh

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION
