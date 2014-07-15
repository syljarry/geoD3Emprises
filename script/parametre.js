/**
 * Variable global adaptable par l'utilisateur.
 * Création de l'objet Carte et de l'objet Legende inclu dans Carte.
 *
 * @author Sylvain JARRY
 */
/* variables à adapter par l utilisateur */
var path_json = "data/fond_pays.json"; // chemin du fond de carte JSON rapport au fichier html
var path_data = "data/";
var colonne_code = "iso_a2"; // nom de la colonne contenant le code permettant de joindre le fond de carte JSON et les données CSV (ex. : "iso_a2" pour le code ISO 2)
var acronymePays = "bo";
var annees = [0, 1, 2, 3, 4];	// liste des années pour lesquelles il y a des données
var annees_labels = ["avr 2013", "juil 2013", "oct 2013", "jan 2014", "avr 2014"];
var anneeFolder = ["_2013_04", "_2013_07", "_2013_10", "_2014_01", "_2014_04"];
var categories = ["_allcats", "_farming", "_biota", "_boundaries", "_climatologyMeteorologyAtmosphere", "_economy",
    "_elevation", "_environment", "_geoscientificInformation", "_health", "_imageryBaseMapsEarthCover",
    "_intelligenceMilitary", "_inlandsWaters", "_location", "_oceans", "_planningCadastre", "_society",
    "_structure", "_transportation", "_utilitiesCommunication", "_null"];
var nomCategories = ["Toute catégories", "Agriculture", "Biote", "Limites", "Climatologie/Météorologie/Atmosphère", "Economie",
    "Altitude", "Environnement", "Informations géoscientifiques", "Santé", "Imagerie/Cartes de base/Occupation des terres",
    "Renseignement/Secteur militaire", "Eaux intérieures", "Localisation", "Océans", "Planification/Cadastre",
    "Société", "Structure", "Transport", "Services d'utilité publique/Communication", "Catégories sans nom"];
// pour la discrétisation des emprises MD
var col_valeur = "nb"; // nom de la colonne des json avec la valeur à représenter
var color_domain = [16, 30, 198, 224, 230, 250, 268, 296, 318]; // bornes pour la discrétisation
var color_range = [ // jeu de couleurs pour la discrétisation
    "rgb(247,251,255)",
    "rgb(222,235,247)",
    "rgb(199,220,239)",
    "rgb(162,204,226)",
    "rgb(114,180,215)",
    "rgb(73,151,201)",
    "rgb(40,120,184)",
    "rgb(13,87,161)",
    "rgb(8,48,107)"
];

// pour les couleurs de la carte choroplèthe
var color = d3.scale.threshold()
    .domain(color_domain)
    .range(color_range);

// largeur des bordures de pays et des emprises
var stroke_width_pays = 1;
var stroke_width_empr = 0;
var duree_transition = 1000;	// durée de la transition en millisecondes quand on change de données à afficher
var duree_transition2 = 500;    //durée de la transition lors du repositionnement des cartes.
var legend_labels = ["1 - 16", "16 - 30", "30 - 198", "198 - 224", "224 - 230", "230 - 250", "250 - 268", "268 - 296", "296 - 318"] // étiquettes de la légende
var titre_leg = "Nombre emprises :"; // titre de la légende
var sous_titre_leg = "Description :";
var type_leg = "Carte représantant des emprises";
// largeur et hauteur des carrés de la légende
var ls_w = 20;
var ls_h = 20;

var tableauCarte = [];	//tableau contenant chaque carte affichée.
var compteur = 0; // utilisé pour la mise en page des cartes, sert a compte les doublet et triplet de carte
var etage = 1; //utilisé pour la mise en page des cartes, sert a descendre d'un étage (d'une ligne) selon la disposition des cartes.
/*Compteur du nombre de carte créé*/
var compteurCarte = 0;

/* Width and height for the years */
var wy = 960;
var hy = 50;

/* padding pour que les ronds, sur la fleche des années, ne sois pas trop au extrémité */
var padding = 50;

/* élément svg pour les années */
var svg_y = d3.select("#years")
    .append("svg")
    .attr("width", wy)
    .attr("height", hy);

/* crée une échelle pour la représentation des années */
var xScale = d3.scale.linear()
    /* input domain : entre min et max des années */
    .domain([d3.min(annees, function(d) { return d; }), d3.max(annees, function(d) { return d; })])
    /* output range : entre 0 et largeur de l élément, + padding */
    .range([0 + 2*padding, wy - 2*padding]);

/* la projection dans laquelle afficher les données : Robinson */
var projection = d3.geo.robinson()
   .scale(150);
/* On crée un nouvel objet path qui traduit le GeoJSON en SVG */
var path = d3.geo.path()
    .projection(projection);
// min et max possible en zoomant (plus maxzoom est élevé, plus on peut zoomer)
var minzoom = 0.7;
var maxzoom = 200;

// centre de la carte et échelle pour la vue initiale (ici, Bolivie)
var centre = [-65, -18];
var echelle = 1300;
// centre la carte, définit l échelle
projection
    .scale(echelle)
    .center(centre);
/* var graticule = d3.geo.graticule(); */

/**
 * Objet carte. Cet objet comprend tout les parametres associé a une carte.
 * Il est utilisé pour manipuler facilement  les cartes dans un tableau de carte.
 *
 * @param id
 *          Identifiant unique de chaque carte.
 * @param Legend
 *          Objet Legende qui comprend les parametre de la légende associé à la carte.
 * @param annee
 *          Année des données de la carte.
 * @param dispo
 *          Type de disposition des données de la carte.
 * @param svg_map
 *          Instance du svg(dessin) de la carte
 * @param cartogroupe
 *          Groupe pour afficher les pays et les cercles
 * @param planigroupe
 *          Groupe pour afficher le planisphere
 * @param emprisesgroupe
 *          Groupe pour dessiner les emprises sur un pays.
 * @param isShown
 *          Indique si la carte est déja dessiné ou non
 * @param div_map
 *          balise div dans le html comprenant l'ensemble de la carte(légende+carte)
 * @param div_legend
 *          balise div comprenant la légende
 * @param div_type
 *          balise div comprenant la premiere partie de la légende(titre+type+svg)
 * @param div_dispo
 *          balise div comprenant la deuxieme partie de la légende(sous-titre+description+checkbox)
 * @param div_carte
 *          balise div comprenant le dessin de la carte.
 * @param synchro
 *          Indique si le zoom est synchroniser sur cette carte.
 * @param zoom
 *          Instance zoom spécifique à la carte.
 * @param scaleX
 *          Echelle linéaire d3 sur l'axe X permettant le zoom semantic sur les cercles
 * @param scaleY
 *          Echelle linéaire d3 sur l'axe Y permettant le zoom semantic sur les cercles
 * @param toolTip
 *          Permet l'affichage d'une tooltip lors du click sur un pays. Comprend nom + valeur de donnée.
 * @constructor
 */
function Carte(id, Legend, annee, dispo, svg_map,
               cartogroupe, planigroupe, emprisesgroupe, isShown, div_map, div_legend,
               div_type, div_dispo, div_carte, synchro, zoom, scaleX, scaleY, toolTip) {

    this.id = id;
    this.Legend = Legend;
    this.annee = annee;
    this.dispo = dispo;
    this.svg_map = svg_map;
    this.cartogroupe = cartogroupe;
    this.planigroupe = planigroupe;
    this.emprisesgroupe = emprisesgroupe;
    this.isShown = isShown;
    this.div_map = div_map;
    this.div_legend = div_legend;
    this.div_type = div_type;
    this.div_dispo = div_dispo;
    this.div_carte = div_carte;
    this.synchro = synchro;
    this.zoom = zoom;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.toolTip = toolTip
}

/**
 * Objet légende compris dans la carte, utilisé pour dessiner la légende à coté de la carte.
 * @param titre
 *          Titre de la légende (comprend la premiere partie)
 * @param sousTitre
 *          Sous titre de la légende(comprend la deuxieme partie)
 * @param type
 *          description du type de carte représenté
 * @param description
 *          description des données affichées
 * @param widthLegend
 *          largeur du svg de la légende
 * @param heightLegend
 *          hauteur du svg de la légende
 * @constructor
 */
function Legend(titre, sousTitre, type, description, widthLegend, heightLegend) {
    this.titre = titre;
    this.sousTitre = sousTitre;
    this.type = type;
    this.description = description;
    this.widthLegend = widthLegend;
    this.heightLegend = heightLegend;
}
