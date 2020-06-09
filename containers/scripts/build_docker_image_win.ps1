
#Create Docker Image on Windows without sh shell installed

Clear-Host
$DOCKERIMAGE="okit"

$Scriptfolder =  Split-Path -Path $PSScriptRoot 
Write-Host $Scriptfolder
               
$Rootfolder= Split-Path -Path $Scriptfolder #(get-item $Scriptfolder ).parent
Write-Host $Rootfolder
$DockerFolder = Join-Path -Path $Scriptfolder -ChildPath "docker"

# Script information

docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder
