# Minimal image for compiling and running C programs in the judge sandbox.
# Built once, reused for every submission. No network access is used at runtime.
FROM alpine:3.20

RUN apk add --no-cache gcc musl-dev libc-dev && \
    addgroup -S judge && adduser -S -G judge -h /home/judge judge

WORKDIR /workspace
USER judge

CMD ["/bin/sh"]
