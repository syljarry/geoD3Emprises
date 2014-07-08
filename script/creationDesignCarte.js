/**
 * Comprend toute les fonctions neccessaires à la création et à la mise en page des
 * cartes en tant qu'objet. Pas de desssin.
 * Ici est créé l'objet carte, qui est placé dans le tableauCarte.
 * La disposition des cartes en liste, grille(2*2), ou colonne(3*1) est gérée ici.
 * La disposition de la légende à gauche, dessous, ou Unique est gérée ici.
 *
 * @author Sylvain JARRY
 */

/**
 * Création d'une nouvelle carte (objet Carte) et ajout dans le tableau des cartes.
 */

function creationNewCarte() {
    var id = compteurCarte;

    /* création de la mise en page avec des div
     <div main>
     <div map>
     <div Legend>
     <div type></div type>
     <div dispo></div dispo>
     </div Legend>
     <div carte>
     <div svg><div svg>
     </div carte>
     </div map>
     ...
     */
    var div_map = d3.select("#main")
        .append("div")
        .attr("id", "map" + id)
        .attr("class", "map");

    var div_legend = div_map.append("div")
        .attr("id", "Legend" + id)
        .attr("class", "Legend");

    var div_type = div_legend.append("div")
        .attr("id", "type" + id)
        .attr("class", "type");

    var div_dispo = div_legend.append("div")
        .attr("id", "dispo" + id)
        .attr("class", "dispo");

    var div_carte = div_map.append("div")
        .attr("id", "carte" + id)
        .attr("class", "carte");

    //Creation d'une toolTip indiquant le nom et la valeur du cercle pour chaque pays.
    var toolTip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip" + id)
        .style("opacity", 0);


    //---------------Création d'un objet Legend.-----------------
    var titre = titre_leg;
    var sousTitre = sous_titre_leg;
    var type = type_leg;
    var donneeLegend = getLegend();
    var description = nomCategories[0] ;
    /* Width and height for the legend*/
    var widthLegend = 150;
    var heightLegend = 240;
    var legend = new Legend(titre, sousTitre, type, donneeLegend, description, widthLegend, heightLegend);

    /* -------------Création d'un objet Carte---------------------*/
    //attribution de l'annee en cour et du type de dispo selectionné
    var annee = getYear();
    var dispo = getCategories(nomCategories[0]);

    /*Création des échelles pour le zoom sémantique. */
    var scaleX = d3.scale.linear(),//.domain([0, position.w]).range([0, position.w]),
        scaleY = d3.scale.linear();//.domain([0, position.h]).range([0, position.h]);

    //instance du zoom
    var zoom = d3.behavior.zoom()
        .x(scaleX).y(scaleY)
        .scaleExtent([minzoom, maxzoom])
        .on("zoom", function () {
            zoomFunction(id);
        });

    //création du svg pour la map
    var svg_map = div_carte.append("svg")
        .attr("id", "c" + id);
    var g_centre = svg_map.append("g")
        .attr("id", "g_centre" + id)
        .call(zoom)
        .on("dblclick.zoom", function () {
            resetZoom(id);
        });
    var g_node = g_centre.append("g");

    g_node.append("rect")
        .attr("class", "overlay")
        .attr("width", screen.width)
        .attr("height", screen.height);

    //création des groupes



    var emprisesgroupe = g_node.append("g").attr("id", "g_emprises");

    var cartogroupe = g_node.append("g").attr("id", "g_carte");

    var planigroupe = g_node.append("g").attr("id", "g_plani");

    var circlegroupe = g_node.append("g").attr("id", "g_cercle");

    //la carte n'est pas encore affiché
    var isShown = false;
    //zoom synchronisé par défaut
    var synchro = true;

    //ajout d'un objet carte dans la liste des cartes
    var carte = new Carte(id, legend, annee, dispo, svg_map,
        cartogroupe, planigroupe, circlegroupe, emprisesgroupe, isShown, div_map, div_legend, div_type,
        div_dispo, div_carte, synchro, zoom, scaleX, scaleY, toolTip);

    tableauCarte.push(carte);

    designCarte(carte);

    compteurCarte++;
}

/**
 * Effectue une organisation des cartes, soit à l'initialisation lors de
 * l'ajout d'une nouvelle carte, soit selon l'organisation
 * choisies par l'utilisateur.
 *
 * @param carte
 *            Nouvelle carte à dessiner.
 */
function designCarte(carte) {
    if (tableauCarte.length == 1) {
        //Lorsqu'il n'y as qu'une carte, on l'affiche en grand moins une marge sur les coté.
        //On réinitialise aussi les valeur lorsque l'on passe de deux cartes à une seule.
        var w = screen.width - (screen.width / 6.5);
        var h = screen.height - (screen.height / 3);
        if (getOrgaLegend() == "Dessous") {
            miseEnPageLegende(tableauCarte[0], h, w, "Dessous");
        }
        else {
            miseEnPageLegende(tableauCarte[0], h, w, "Gauche");
            tableauCarte[0].svg_map.transition().duration(duree_transition2)
                .attr("width", w)
                .attr("height", h);
            tableauCarte[0].div_legend
                .style("height", h + "px");
            tableauCarte[0].div_carte
                .style("height", h + "px")
                .style("width", w + "px");
        }
        internCentrageCarte(300,100);
        dessin_carte(tableauCarte[0]);
    }
    if (tableauCarte.length > 1) {
        var orga = getOrga();
        if (orga == "liste") {
            internCentrageCarte(0,0);
            designCarteListe();
        }
        if (orga == "grille") {
            internCentrageCarte(-150,0);
            designCarteGrille();
        }
        if (orga == "colonne") {
            if(tableauCarte.length > 2) {
                internCentrageCarte(-250, 0);
            }
            else{internCentrageCarte(-150,0);}
            designCarteColonne();
        }
        dessin_carte(carte);
    }
    /**
     * Permet le centrage des cartes en modifiant l'élément "g_centre" de chaque carte.
     * @param x
     *          centrage sur la coordonnée x
     * @param y
     *          centrage sur la coordonnée y
     */
    function internCentrageCarte(x, y) {
        //on centre les cartes vers le milieu de l'écran
        for (var i = 0; i < tableauCarte.length; i++) {
            d3.select("#g_centre" + tableauCarte[i].id).transition().duration(duree_transition2)
                .attr("transform", "translate(" + x + "," + y + ")");
        }
    }
}

/**
 * Permet une mise en liste des cartes. Les cartes sont disposées les unes à la suite des autres.
 * La taille des cartes est proportionnelle à la résolution de l'écran, de maniere
 * a avoir au moins 2 cartes par pages.
 */
function designCarteListe() {
    //Récupere la taille de l'écran de l'utilisateur moins un certain padding
    var w = screen.width - (screen.width / 9.5);
    var h = (screen.height - (screen.height / 3)) / 2;
    compteur = 0;
    etage = 0;
    for (var i = 0; i < tableauCarte.length; i++) {
        miseEnPageCarte(tableauCarte[i], w, h, compteur, etage);
        etage++;
    }
}

/**
 * Permet une mise en forme des cartes en grilles. La taille de cartes est
 * proportionnelle à la résolution de l'écran, de maniere a avoir deux cartes
 * par ligne et par colonne. Donc 4 cartes par pages.
 * Les deux variable compteur et etage sont utilisé pour savoir si on
 * à atteint deux cartes sur un meme étage. Une fois atteint on descend d'un étage.
 *
 */
function designCarteGrille() {
    //Récupere la taille de l'écran de l'utilisateur moins un certain padding.
    var w = (screen.width - (screen.width / 19.5)) / 2;
    var h = (screen.height - (screen.height / 3)) / 2;
    compteur = 0;
    etage = 0;
    for (var i = 0; i < tableauCarte.length; i++) {
        if (tableauCarte.length == 2) {
            //Si on a que deux carte, on prend toute la hauteur
            h = (screen.height - (screen.height / 3));
        }
        if (compteur > 1) {
            etage++;
            compteur = 0;
        }
        miseEnPageCarte(tableauCarte[i], w, h, compteur, etage);
        compteur++;
    }
}

/**
 * Permet une mise en forme des cartes en colonne, les cartes
 * sont disposé en colonne de 3 par pages.
 * La taille des cartes est calculé en fonctiond ela résolution de l'écran
 */
function designCarteColonne() {
    //Récupere la taille de l'écran de l'utilisateur moins un certain padding.
    var w = (screen.width - (screen.width / 19.5)) / 3;
    var h = (screen.height - (screen.height / 3));
    compteur = 0;
    etage = 0;

    for (var i = 0; i < tableauCarte.length; i++) {
        if (tableauCarte.length == 2) {
            //Si on a que deux carte, on prend toute la largeur
            w = (screen.width - (screen.width / 19.5)) / 2;
        }
        //On compte par palier de 3, puis on descend d'un étage.
        if (compteur > 2) {
            etage++;
            compteur = 0;
        }
        miseEnPageCarte(tableauCarte[i], w, h, compteur, etage);
        compteur++;
    }
}

/**
 * Permet la mise en page des cartes pour les fonctions designListe, designCarteGrille et
 * designCarteColonne.
 * Appele ensuite la fonciton miseEnPageLegend pour mettre en forme la légende de chauqe carte.
 * Applique un padding top ou left selon la disposition et les valeurs en parametre.
 * Applique la taille des cartes en fonction de la taille passer en parametre.
 *
 * @param carte
 *             Objet carte a modifier.
 * @param w
 *         Largeur à appliquer sur les différent éléments.
 * @param h
 *         Hauteur à appliquer sur les différents éléments.
 * @param compteur
 *          nombre de carte, sert pour les doublets ou triplets
 *          de carte afin d'appliquer la bonne marge ou incrémenter l'étage.
 * @param etage
 *          augmente la marge en hauteur pour faire descendre les cartes quand le compteur est atteint.
 */
function miseEnPageCarte(carte, w, h, compteur, etage) {
    carte.div_map
        .style("margin-top", function () {
            return ((etage) * (h + 30)) + "px";
        })
        .style("width", w + "px");
    if (compteur > 0) {
        //on ajoute une marge d'un tier de l'écran a chaque nouvelle carte de la ligne.
        carte.div_map.transition().duration(duree_transition2)
            .style("margin-left", function () {
                return (w * compteur) + "px";
            });
    }
    else {
        //On place ou replace la premiere carte de la ligne a gauche.
        carte.div_map.transition().duration(duree_transition2)
            .style("margin-left", 0 + "px");
    }

    miseEnPageLegende(carte, h, w, getOrgaLegend());
}

/**
 * Permet la mise en page de la légende pour chaque carte passée en parametre.
 * Trois disposition sont disponible, Gauche pour que les légende soit à gauche de chaque carte,
 * Unique pour que seulement la premiere carte est une légende,
 * Dessous pour que la légende se retrouve en dessous de chaque carte dans une version plus petite.
 * On redimensionne aussi la carte en fonction de la nouvelle position de la légende.
 *
 * @param carte
 *         Objet carte sur lequel on applique les modification
 * @param w
 *         Largeur à appliquer sur les différent éléments.
 * @param h
 *         Hauteur à appliquer sur les différents éléments.
 * @param position
 *         Type de position selectionner : Gauche, Unique ou Dessous.
 */
function miseEnPageLegende(carte, h, w, position) {
    var wcarte, marcarte, wsvg;
    if (position == "Gauche") {
        internConfigLegend();
        internConfigLegendGauche();
        //Modification de la taille de la carte par les parametre donné moins la taille de la légende.
        wcarte = w - parseFloat(carte.div_legend.style("width"));
        marcarte = 9 + parseFloat(carte.div_legend.style("width"));//+9 de padding pour afficher entierement le bouton "supprimer".
        wsvg = w - parseFloat(carte.div_legend.style("width"));
        internConfigCarte(wcarte, marcarte, wsvg);
    }
    if (position == "Unique") {
        if (carte.id == tableauCarte[0].id) {
            internConfigLegend();
            internConfigLegendGauche();
            //Modification de la taille de la carte par les parametres donné moins la taille de la légende.
            wcarte = w - parseFloat(carte.div_legend.style("width"));
            marcarte = 9 + parseFloat(carte.div_legend.style("width"));//+9 de padding pour afficher entierement la liste des données.
            wsvg = w - parseFloat(carte.div_legend.style("width"));
            internConfigCarte(wcarte, marcarte, wsvg);
        }
        else {
            //On cache puis on réduit la légende de la carte.
            carte.div_legend.style("visibility", "hidden")
                .style("width", 20 + "px");
            //Changement de la taile de la carte en fonction de la nouvelle taille de la légende.
            wcarte = w - parseFloat(carte.div_legend.style("width"));
            marcarte = parseFloat(carte.div_legend.style("width"));
            wsvg = w - parseFloat(carte.div_legend.style("width"));
            internConfigCarte(wcarte, marcarte, wsvg);
        }
    }
    if (position == "Dessous") {
        //Modification de la taille de la carte par les parametre donné moins la taille de la légende.
        wcarte = w - 20;
        marcarte = 10;
        wsvg = w - 20;
        internConfigCarte(wcarte, marcarte, wsvg);
        //Modification de la légende pour l'avoir en dessous.
        carte.div_legend
            .style("width", carte.div_carte.style("width"))
            .style("height", 90 + "px")
            .style("visibility", "visible")
            .style("margin-top", (parseFloat(carte.div_carte.style("height")) - 100) + "px");
        carte.div_type.style("height", carte.div_legend.style("height"));
        carte.div_type.select("h2").text(null);
        carte.div_type.select("p").text(null);

        carte.div_type.select("svg").attr("height", 80);
        carte.div_dispo.select("h2").text(null);
        carte.div_dispo.style("margin-top", 0 + "px")
            .style("margin-left", 280 + "px");
        //!!!!!!!!!!!!!!!!!!!!!!
        interConfigLegendDessous();
        //!!!!!!!!!!!!!!!!!!!!!!!!!!

    }

    function internConfigLegend() {
        //Reorganisation de la légende par défaut, pour les cas ou elle a été modifée.
        carte.div_legend
            .style("height", h + "px")
            .style("width", 200 + "px")
            .style("visibility", "visible")
            .style("margin-top", 0 + "px");
        carte.div_type.select("h2").text(carte.Legend.titre);
        carte.div_type.select("p").text(carte.Legend.type);
        carte.div_type.select("svg").attr("height", carte.Legend.heightLegend + "px");
        carte.div_dispo.select("h2").text(carte.Legend.sousTitre);
        carte.div_dispo.style("margin-top", 210 + "px")
            .style("margin-left", 0 + "px");
    }

    function internConfigCarte(wcarte, marcarte, wsvg) {
        //Réorganisation de la taille de la carte, la hauteur ne change pas, on prend donc
        //celle passée en parametre de la fonction mère.
        carte.div_carte
            .style("height", h + "px")
            .style("width", (wcarte) + "px")
            .style("margin-left", marcarte + "px");
        carte.svg_map.transition().duration(duree_transition2)
            .attr("width", wsvg)
            .attr("height", h);
    }

    function interConfigLegendDessous() {
        //refonte du svg legende :
        carte.div_type.select("svg").remove();
        //svg pour la légende
        var svg_legende = carte.div_type.append("svg")
            .attr("width", 800)
            .attr("height", 70);

        var legend = svg_legende.selectAll("g.legend")
            .data(color_domain)
            .enter()
            .append("g")
            .attr("class", "legend");

        var compteur = 0;
        var etage = 0;
        var colonne = -1;
        legend.append("rect")
            .attr("x", function () {
                if (compteur > 2) {
                    compteur = 1;
                    etage++;
                }
                else {
                    compteur++;
                }
                return 80 * etage;
            })
            .attr("y", function () {
                if (colonne > 1) {
                    colonne = 0;
                }
                else {
                    colonne++;
                }
                return colonne * ls_h;
            })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d) {
                return color(d);
            })
            .style("stroke", "gray")
            .style("stroke-width", 0)
            .style("opacity", 0.8);

        compteur = 0;
        etage = 0;
        colonne = -1;
        legend.append("text")
            .attr("x", function (d, i) {
                if (compteur > 2) {
                    compteur = 1;
                    etage++;
                }
                else {
                    compteur++;
                }
                return i < 3 ? 20 + 100 * etage : 100 * etage;
            })
            .attr("y", function () {
                if (colonne > 1) {
                    colonne = 0;
                }
                else {
                    colonne++;
                }
                return ls_h + colonne * ls_h;
            })
            .text(function (d, i) {
                return legend_labels[i];
            });
    }

    function internConfigLegendGauche(){
        carte.div_type.select("svg").remove();
        //svg pour la légende
        var svg_legende = carte.div_type.append("svg")
            .attr("width", 800)
            .attr("height", carte.Legend.heightLegend);
// Légende pour la carte choroplèthe
        svg_legende.append("text")
            .attr("x", 20)
            .attr("y", 30)
            .text(titre_leg);

        var legend = svg_legende.selectAll("g.legend")
            .data(color_domain)
            .enter()
            .append("g")
            .attr("class", "legend");


        legend.append("rect")
            .attr("x", 20)
            .attr("y", function (d, i) {
                return carte.Legend.heightLegend - (i * ls_h) - 2 * ls_h;
            })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) {
                return color(d);
            })
            .style("stroke", "gray")
            .style("stroke-width", 0)
            .style("opacity", 0.8);

        legend.append("text")
            .attr("x", 50)
            .attr("y", function (d, i) {
                return carte.Legend.heightLegend - (i * ls_h) - ls_h - 4;
            })
            .text(function (d, i) {
                return legend_labels[i];
            });
    }
}
