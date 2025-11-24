FROM --platform=linux/amd64 ubuntu:22.04 AS build

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y openjdk-17-jdk unzip curl git xz-utils zip libglu1-mesa && \
    rm -rf /var/lib/apt/lists/*

ENV ANDROID_HOME="/opt/android-sdk"
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip && \
    unzip commandlinetools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm commandlinetools.zip

RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

ENV FLUTTER_HOME="/opt/flutter"
ENV PATH="${PATH}:${FLUTTER_HOME}/bin"

RUN git clone https://github.com/flutter/flutter.git ${FLUTTER_HOME} && \
    chown -R root:root ${FLUTTER_HOME} && \
    chmod -R 755 ${FLUTTER_HOME} && \
    flutter config --no-analytics && \
    mkdir -p ${FLUTTER_HOME}/bin/cache/artifacts/gradle_wrapper && \
    curl -L https://storage.googleapis.com/flutter_infra_release/gradle-wrapper/fd5c1f2c013565a3bea56ada6df9d2b8e96d56aa/gradle-wrapper.tgz -o gradle-wrapper.tgz && \
    tar --no-same-owner -xzf gradle-wrapper.tgz -C ${FLUTTER_HOME}/bin/cache/artifacts/gradle_wrapper && \
    rm gradle-wrapper.tgz && \
    flutter doctor

WORKDIR /app

COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . .

ARG API_BASE_URL
RUN flutter build apk --dart-define=API_BASE_URL=$API_BASE_URL --release

FROM nginx:alpine
COPY --from=build /app/build/app/outputs/flutter-apk/app-release.apk /usr/share/nginx/html/app-release.apk
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
