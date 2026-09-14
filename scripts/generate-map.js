const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.join(__dirname, '../');
const OUTPUT_JSON = path.join(ROOT_DIR, 'site-map.json');

// Dossiers à ignorer
const IGNORE_DIRS = ['.git', 'node_modules', '.github', 'scripts', 'assets/css', 'assets/js'];

function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
        
        if (IGNORE_DIRS.some(ignored => relativePath.startsWith(ignored))) {
            return;
        }

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, fileList);
        } else if (file.endsWith('.html') || file.endsWith('.pdf')) {
            fileList.push({ absolutePath: filePath, relativePath: relativePath });
        }
    });
    return fileList;
}

// Résolution rigoureuse façon navigateur (support des chemins relatifs, absolus et GitHub Pages)
function resolveUrl(sourcePath, href) {
    if (!href) return null;

    // Nettoyage des ancres (#...) et des requêtes (?...)
    let cleanHref = href.split('#')[0].split('?')[0].trim();
    if (!cleanHref) return null;

    // Ignorer les protocoles externes ou techniques
    if (cleanHref.startsWith('mailto:') || cleanHref.startsWith('tel:') || cleanHref.startsWith('javascript:')) {
        return null;
    }

    // Gestion des URL absolues http(s)
    if (cleanHref.startsWith('http://') || cleanHref.startsWith('https://')) {
        if (!cleanHref.includes('grielbakansambu-glitch.github.io/G-riel')) {
            return null;
        }
        try {
            const urlObj = new URL(cleanHref);
            cleanHref = urlObj.pathname.replace(/^\/G-riel\/?/, '');
        } catch (e) {
            return null;
        }
    }

    // Gestion des chemins absolus du type /G-riel/... ou /...
    if (cleanHref.startsWith('/')) {
        cleanHref = cleanHref.replace(/^\/G-riel\/?/, '').replace(/^\//, '');
    }

    let resolved = '';

    if (href.startsWith('/') || cleanHref === href && !href.startsWith('./') && !href.startsWith('../')) {
        // Chemin interprété depuis la racine du projet
        resolved = cleanHref;
    } else {
        // Résolution par rapport au dossier de la page source
        const sourceDir = path.dirname(sourcePath);
        resolved = path.join(sourceDir, cleanHref).replace(/\\/g, '/');
    }

    // Normalisation des remontées (suppression des segments '..')
    const segments = resolved.split('/');
    const stack = [];
    for (const seg of segments) {
        if (seg === '..') {
            stack.pop();
        } else if (seg && seg !== '.') {
            stack.push(seg);
        }
    }
    resolved = stack.join('/');

    // Si le lien pointe vers un dossier sans extension, supposer index.html
    if (resolved && !path.extname(resolved)) {
        resolved = resolved.endsWith('/') ? resolved + 'index.html' : resolved + '/index.html';
    }

    if (!resolved || resolved === '') {
        resolved = 'index.html';
    }

    return resolved;
}

function classifyNode(relativePath) {
    if (relativePath === 'index.html' || relativePath === '') return 'root';
    if (relativePath.startsWith('labs/')) return 'lab';
    if (relativePath.startsWith('assets/PDF/')) return 'project';
    if (['projects.html', 'notes.html', 'homelab.html', 'roadmap.html'].includes(relativePath)) return 'project';
    return 'page';
}

function generateMap() {
    console.log("🌱 [V3 - Définitive] Analyse structurelle et topologique de G-RIEL...");
    const files = walkDir(ROOT_DIR);
    
    const nodesMap = new Map();
    const rawLinks = [];

    // 1. Indexation brute de tous les fichiers du dépôt
    files.forEach(file => {
        const rel = file.relativePath;
        let title = path.basename(rel, path.extname(rel));
        let content = '';

        if (file.absolutePath.endsWith('.html')) {
            content = fs.readFileSync(file.absolutePath, 'utf-8');
            const $ = cheerio.load(content);
            const titleTag = $('title').first().text();
            if (titleTag) {
                title = titleTag.trim().replace(/\s*—.*$/, '');
            }
        }

        const type = file.absolutePath.endsWith('.pdf') ? 'pdf' : 'html';
        const group = classifyNode(rel);

        nodesMap.set(rel, {
            id: rel,
            title: title,
            group: group,
            url: rel,
            path: rel,
            type: type,
            isOrphan: false
        });

        // Extraction des liens hypertextes pour les fichiers HTML
        if (type === 'html') {
            const $ = cheerio.load(content);
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                const targetPath = resolveUrl(rel, href);
                if (targetPath) {
                    rawLinks.push({ source: rel, target: targetPath });
                }
            });
        }
    });

    // 2. Validation et filtrage des liens (la cible et la source doivent exister)
    const validLinks = [];
    const incomingLinksCount = new Map(); // Permet de compter les liens ENTRANTS

    // Initialiser le compteur pour tous les nœuds
    nodesMap.forEach((_, key) => {
        incomingLinksCount.set(key, 0);
    });

    rawLinks.forEach(link => {
        if (nodesMap.has(link.source) && nodesMap.has(link.target)) {
            if (link.source !== link.target) { // Ignorer les auto-boucles
                validLinks.push({ source: link.source, target: link.target });
                
                // Incrémenter le nombre de liens ENTRANTS sur la cible
                const currentCount = incomingLinksCount.get(link.target) || 0;
                incomingLinksCount.set(link.target, currentCount + 1);
            }
        }
    });

    // 3. Filtrage des PDF : seuls les PDF référencés par au moins un lien entrant sont conservés
    nodesMap.forEach((node, key) => {
        if (node.type === 'pdf') {
            const incoming = incomingLinksCount.get(key) || 0;
            if (incoming === 0) {
                nodesMap.delete(key); // Retiré car non lié (reste dans le dépôt sans encombrer la carte)
                incomingLinksCount.delete(key);
            }
        }
    });

    // 4. Détection stricte des orphelins (absence de lien entrant, hormis la racine)
    nodesMap.forEach((node, key) => {
        if (key === 'index.html') {
            node.isOrphan = false;
            return;
        }

        const incoming = incomingLinksCount.get(key) || 0;
        if (incoming === 0) {
            node.isOrphan = true;
            console.log(`⚠️ [Orphelin détecté] : "${key}" possède 0 lien entrant (aucun parent ne pointe vers lui).`);
        }
    });

    const orphanCount = Array.from(nodesMap.values()).filter(n => n.isOrphan).length;

    const outputData = {
        generatedAt: new Date().toISOString(),
        stats: {
            totalNodes: nodesMap.size,
            totalLinks: validLinks.length,
            totalOrphans: orphanCount
        },
        nodes: Array.from(nodesMap.values()),
        links: validLinks
    };

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`✅ [V3] Succès ! ${nodesMap.size} nœuds, ${validLinks.length} relations et ${orphanCount} orphelin(s) enregistrés dans site-map.json.`);
}

generateMap();