# Chat API + Ollama Project

## Prerequisits
- Node.js (v25)
- Docker
- Docker Compose

## Programari necessari

### 1. MySQL/MariaDB

#### 1a. Iniciar MySQL amb Docker
Revisar el fitxers docker-compose-dev.yml i docker-compose-test.yml del del directori "docker"

#### 1b. Accés remot via SSH Tunnel
```bash
ssh -i <id_rsa_user_proxmox> -p 20127 -L 3306:3306 <user>@ieticloudpro.ieti.cat
```

#### 1c. MySQL instal·lat en local

Instal·lar el programari a Linux o Windows i caldrà crear la base de dades i assignar permisos a l'usuari.


### 2. Ollama, alternatives

Hi ha diverses maneres de configurar i accedir a Ollama per al projecte:

#### 2a. (Preferida) Accés remot via SSH Tunnel al servidor de l'institut
```bash
ssh -i <id_rsa_user_proxmox> -p 20127 -L 11434:192.168.1.14:11434 <user>@ieticloudpro.ieti.cat
```

#### 2b. Docker (Opció vàlida si es disposa de GPU amb prou VRAM en el equip)
```bash
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

#### 2c. Instal·lació nativa en el sistema operatiu

##### Linux
```bash
curl https://ollama.ai/install.sh | sh
```

##### Windows
1. Descarregar l'instal·lador de [https://ollama.ai/download](https://ollama.ai/download)
2. Executar l'instal·lador
3. Iniciar Ollama des del menú d'inici



#### Notes importants sobre Ollama
- L'SSH tunnel permet accedir a una instància remota d'Ollama sense necessitat d'instal·lació local
- La instal·lació nativa pot ser més senzilla per desenvolupament local
- Ollama usa el port per defecte 11434
- Pots treballar amb diferents instàncies d'Ollama i canviar entre elles. Hauràs de tenir en compte el port.
- En cas de problemes d'accés, revisar el tallafocs


#### Verificació
Per verificar que Ollama està funcionant correctament:
```bash
curl http://localhost:11434/api/tags
```

Si la resposta mostra una llista de models disponibles, la configuració és correcta.


## Configuració de les aplicacions

En el README de cadasdun dels 3 projecte trobaràs instruccions sobre com configurar-les i executar-les
