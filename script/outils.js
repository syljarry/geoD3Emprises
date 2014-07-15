/**
 * Regroupement des fonction Outils, comme le masquage d'élément, l'obtention
 * de la case coché parmis les boutons radio, la suppression des cartes, et d'autres...
 *
 * @author Sylvain JARRY
 */

/**
 * Renvoi le type d'organisation des cartes choisi par l'utilisateur.
 *
 * @returns {string}
 *          liste : pour avoir les carte en liste.
 *          grille : pour avoir les cartes en grille.
 */
var getOrga = function () {
    var orga = document.getElementById("liste").checked;
    if (orga == true) {
        return "liste";
    }
    orga = document.getElementById("grille").checked;
    if (orga == true) {
        return "grille";
    }
    orga = document.getElementById("colonne").checked;
    if (orga == true) {
        return "colonne";
    }
};

/**
 * Renvoi le type d'organisation des légendes choisis par l'utilisateur.
 *
 * @returns {string}
 *          Gauche : légende situé a gauche
 *          Unique : Une seul légende sur la premiere carte.
 *          Dessous : Legende situé en dessous.
 */
var getOrgaLegend = function() {
    var orga = document.getElementById("Gauche").checked;
    if (orga == true) {
        return "Gauche";
    }
    orga = document.getElementById("Unique").checked;
    if (orga == true) {
        return "Unique";
    }
    orga = document.getElementById("Dessous").checked;
    if (orga == true) {
        return "Dessous";
    }
};

/**
 *  Cherche et retourne le nom du chemin d'accé à la catégorie passer en parametre.
 *  @param cat
 *      nom de la catégorie selectionné par l'utilisateur.
 *  @return {string}
 *          chemin d'accé au fichier de la catégorie selectionné par l'utilisateur.
 */
function getCategories(cat){
    //cherche l'index dans le tableau des nom
    return categories[nomCategories.indexOf(cat)];
}
/**
 * Renvoi l'année actuelement séletionnée
 *
 * @returns {string}
 */
var getYear = function () {
    return d3.select(".yearselect").text();
};
/**
 * Cherche et retourne le chemin d'accé au fichier de l'année passer en parametre.
 * @param year
 *      année selectionné par l'utilisateur.
 * @returns {string}
 *      chemin d'accé au fichier de l'année corespondante
 */
var getYearFolder = function(year){
    return anneeFolder[annees_labels.indexOf(year)];
};
/**
 * Cherche la position dans le tableau de carte,
 * de l'objet carte qui correspond a l'id passé en parametre.
 *
 * @param id
 *          identifiant de l'objet carte que l'on veut trouver
 */
var indexTableau = function(id) {
    for (var i = 0; i < tableauCarte.length; i++) {
        if (id == tableauCarte[i].id) {
            return i;
        }
    }
};

/**
 * Supprime la carte correspondant à l'id passé en parametre.
 * Supprime l'objet du tableau, ainsi que la <div> correspondante.
 * Reposition également toute les autres cartes, en appellant designCarte().
 *
 * @param id
 *          identifiant de l'objet carte que l'on veut supprimer
 */
function suppressionCarte(id) {
    //supprime l'element du tableau de carte global.
    tableauCarte.splice(indexTableau(id), 1);

    //supprime la div correspondante au bouton cliqué
    var div_map = document.getElementById("map" + id);
    div_map.parentNode.removeChild(div_map);
    //suppression du tooltip associé a la carte
    var div_tooltip = document.getElementById("tooltip" + id);
    div_tooltip.parentNode.removeChild(div_tooltip);

    //repositionnement des cartes.
    designCarte(tableauCarte[indexTableau(id)]);
}

//Affiche une nouvelle fenetre (popup) avec les conseil d'utilisation
function open_infos() {
    var strWindowFeatures = "resizable=yes,scrollbars=yes, top=10, left=10, width=300, height=650";
    window.open('info.html', 'Info', strWindowFeatures);
}
