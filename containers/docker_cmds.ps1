
docker list 

docker login container-registry.oracle.com
Username: johannes.dumitru@oracle.com

docker-compose up --detach
#docker build --tag okit --file containers/docker/Dockerfile --force-rm containers/docker
#docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder

docker remove c0c09f7956e4
docker rmi Image c0c09f7956e4
docker images -a

user :ansh81vru1zp/jdoe@acme.com

https://eu-zurich-1.ocir.io  && https://zrh.ocir.io
https://eu-frankfurt-1.ocir.io && https://fra.ocir.io

docker login fra.ocir.io
docker push fra.ocir.io/frxfz3gch4zb/okit:latest


mcr.microsoft.com/vscode/devcontainers/base   0-alpine-3.12       60f7b05646b7        11 days ago         129MB
vsc-vcpkg-f54ab3ed2c62499c5618e101a718ea53    latest              60f7b05646b7        11 days ago         129MB
okit                                          latest              dbe5162d2282        2 weeks ago         234MB
alpine                                        latest              a24bb4013296        4 months ago        5.57MB
oraclelinux                                   7-slim              3f15c01b91bb        5 months ago        120MB
alpine                                        3.11.2              cc0abc535e36        9 months ago        5.59MB
fnproject/fnserver                            latest              2ea3b8195f21        10 months ago       162MB
