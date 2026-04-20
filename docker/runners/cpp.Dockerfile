# Minimal image for compiling and running C++ programs in the judge sandbox.
FROM alpine:3.20

RUN apk add --no-cache g++ libc-dev && \
    addgroup -S judge && adduser -S -G judge -h /home/judge judge

WORKDIR /workspace
USER judge

CMD ["/bin/sh"]
