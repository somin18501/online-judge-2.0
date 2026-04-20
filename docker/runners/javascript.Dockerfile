# Minimal image for running JavaScript programs via Node.js in the judge sandbox.
FROM node:20-alpine

RUN addgroup -S judge && adduser -S -G judge -h /home/judge judge

WORKDIR /workspace
USER judge

CMD ["/bin/sh"]
