
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

#Create Docker Image on Windows without sh shell installed

Clear-Host
$DOCKERIMAGE="okit"

$Scriptfolder =  Split-Path -Path $PSScriptRoot 

$Rootfolder= Split-Path -Path $Scriptfolder 
Write-Host $Rootfolder
$DockerFolder = Join-Path -Path $Scriptfolder -ChildPath "docker"
Write-Host $DockerFolder

docker kill okit
docker rmi okit

Write-Host "*******************************************************************"
Write-Host "**                                                               **"
Write-Host "**  Building OL7 Image                                           **"
Write-Host "**                                                               **"
Write-Host "*******************************************************************"

docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder

#$images= $(docker images -f "dangling=true" -q)
#docker rmi ${images}
docker images

Write-Host "*******************************************************************"
Write-Host "**                                                               **"
Write-Host "**  Building OL7 Image Complete                                   **"
Write-Host "**                                                               **"
Write-Host "*******************************************************************"


