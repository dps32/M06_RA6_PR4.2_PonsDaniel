Aquí tens una guia ràpida en format **Markdown pur** amb les comandes més utilitzades per gestionar el teu entorn. Com que el teu fitxer té un nom personalitzat, he inclòs el flag `-f` en els exemples.

```markdown
# Guia de Docker Compose (`docker-compose-dev.yml`)

### 1. Aixecar els serveis
Crea i inicia els contenidors en segon pla (recomanat).
```bash
docker-compose -f docker-compose-dev.yml up -d

```

### 2. Aturar els serveis

Atura els contenidors però no els elimina.

```bash
docker-compose -f docker-compose-dev.yml stop

```

### 3. Aturar i eliminar

Atura els contenidors i els elimina, però **manté els volums** (les dades de la DB es guarden).

```bash
docker-compose -f docker-compose-dev.yml down

```

### 4. Reiniciar els serveis

Útil si has fet algun canvi petit o vols refrescar l'estat.

```bash
docker-compose -f docker-compose-dev.yml restart

```

### 5. Veure l'estat i logs

Per comprovar si el contenidor està funcionant o per veure errors de MySQL:

```bash
# Llistat de contenidors i ports
docker-compose -f docker-compose-dev.yml ps

# Veure els logs en temps real
docker-compose -f docker-compose-dev.yml logs -f

```

### 6. Neteja total (Atenció!)

Atura, elimina contenidors i **esborra els volums** (es perdran totes les dades de la base de dades).

```bash
docker-compose -f docker-compose-dev.yml down -v

```

### 7. Executar comandes dins del contenidor

Si vols entrar a la línia de comandes de MySQL directament:

```bash
docker exec -it mp06-tema3-api-mysql mysql -u chatuser -pchatpass

```

```

Vols que t'ajudi a crear un fitxer `.sh` o `.bat` per executar aquestes comandes amb un sol clic?

```