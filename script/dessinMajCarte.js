/**
 * Fonctions permettant de dessiner les cartes après leur mise en page.
 * Dessin des pays, du planisphere (cercle autour représentant la surface du globe) et des cercles.
 * Mise a jour des dessins, utilisé lors du changement de donnée ou d'année.
 *
 * @author Sylvain JARRY
 */


/**
 * Dessine la légende associé à la carte passé en paramètre
 *
 * @param carte
 *              Objet carte pour lequel on dessine la légende
 */
var dessin_Legend = function(carte) {
    /*--------------Premiere partie : titre, type, svg légende--------------------- */
    if (getOrgaLegend() == "Dessous") {
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
            .attr("y", function (d, i) {
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
            .style("fill", function (d, i) {
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
            .attr("y", function (d, i) {
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
        carte.div_dispo.append("h2")
            .text(null);

    }
    else {
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
        carte.div_dispo.append("h2")
            .text(carte.Legend.sousTitre);
    }
    /*--------------Deuxieme partie : sous-titre, description, checkBox--------------------- */
    carte.div_dispo.append("p")
        .html("Année : " + carte.annee + "<br/>" + carte.Legend.description);
    //Ajout d'une checkBox pour arreter de syncroniser les zoom
    carte.div_dispo.append("input")
        .attr("type", "checkbox")
        .attr("id", "checkZoom" + carte.id)
        .attr("onclick", "desynchroZoom(" + carte.id + ");");
    carte.div_dispo.append("label")
        .attr("for", "checkZoom" + carte.id)
        .text("Désynchroniser le zoom");

};

/**
 * Met à jour la légende de l'objet carte passer en parametre.
 * Modifie la description.
 *
 * @param carte
 *              Objet carte dont on veut modifier la légende.
 */
var maj_Legend = function(carte) {
    carte.div_dispo.select("p")
        .html("Année : " + carte.annee + "<br/>" + carte.Legend.description);
};

/**
 * Dessine les pays (utilisé pour dessiner la carte la 1ère fois)
 * Associe une couleur différente a un pay si des données le concerne ou non
 *
 * @param json
 *              fichier json comprenant la position des pays
 * @param carte
 *              Objet carte pour lequel on dessine.
 */
var dessin_pays = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé */
    var pays = carte.cartogroupe.selectAll("path")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    pays.enter()
        .append("path")
        .attr("d", path)
        .attr("class", "cl_pays")
        // si volontaires pour le pays, ce pays prend une couleur différente
        /*.style("fill", function (d) {
            // Get data value
            var value = d.properties[carte.dispo + carte.annee];
            if (value) {
                // If value exists…
                return couleur_data;
            }
        })*/
        .on("click", function (d) {
            return toolTipShow(d, carte);
        })
        .on("mouseout", function () {
            return toolTipHide(carte);
        });
    //Fait apparaitre un toolTip indiquant le nom et la valeur du pays auquel il appartient.
    function toolTipShow(d, carte) {
        carte.toolTip.transition()
            .duration(500)
            .style("opacity", 1)
            .text(d.properties.sovereignt)
            .style("left", (d3.event.pageX - 38) + "px")
            .style("top", (d3.event.pageY - 43) + "px");
    }
    //Fait disparaitre le toolTip
    function toolTipHide(carte) {
        carte.toolTip.transition()
            .duration(500)
            .style("opacity", 0);
    }
};

/**
 * Mise à jour des pays (avec transition).
 * Change la couleur des pays selon les nouvelles données de l'objet carte.
 *
 * @param json
 *              fichier json comprenant la positions des pays
 * @param carte
 *              Objet carte pour lequel on veut mettre a jour les pays.
 */
var maj_pays = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé */
    var pays = carte.cartogroupe.selectAll("path")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    pays.transition()
        .duration(duree_transition)
        .attr("d", path);
        /* si volontaires pour le pays, ce pays prend une couleur différente */
        /*.style("fill", function (d) {
            // Get data value
            var value = d.properties[carte.dispo + carte.annee];
            if (value) {
                // If value exists…
                return couleur_data;
            } else {
                return couleur_nodata;
            }

        });*/
};


/**
 *  Dessin des cercles proportionnels (utilisé pour dessiner la carte la 1ère fois)
 *  Affiche des cercles sur chaque pays suivant les données passés en parametre.
 *
 * @param json
 *              fichier json comprenant la positions des pays.
 * @param carte
 *              Objet carte pour lequel on veut dessiner les cercles.
 */
var dessin_cercles = function (json, carte) {
    //desactive les event souris pour afficher correctement le toolTip sur les pays.
    carte.circlegroupe.style("pointer-events", "none");
    /* joint les données (data) dans l ordre du code iso2,
     qui sert de clé (sinon problème car cercles triés ensuite par taille)
     */
    var circles = carte.circlegroupe
        .selectAll("circles")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    //dessin des cercles.
    var circle = circles.enter();
    circle.append("circle")
        .attr("cx", function (d) {
            var centroid = path.centroid(d);
            return centroid[0];
        })
        .attr("cy", function (d) {
            var centroid = path.centroid(d);
            return centroid[1];
        })
        /* calcule le rayon du cercle pour que la surface varie avec la valeur */
        .attr("r", function (d) {
            var nbvol = d.properties[carte.dispo + carte.annee];
            return calc_rayon(nbvol);
        })
        /* si la valeur est suffisamment importante, vide le cercle pour qu on ne voit que le contour */
        .attr("class", function (d) {
            var value = d.properties[carte.dispo + carte.annee];
            if (value > evide) {
                return "gros";
            }
        })
        .attr("id", "circlemap")
        /* trie les cercles en fonction du nb de vol pour mettre les + petits devant */
        .sort(function (a, b) {
            return b.properties[carte.dispo + carte.annee] - a.properties[carte.dispo + carte.annee];
        });
};

/**
 *  Mise à jour des cercles proportionnels (avec transition)
 *  Change le rayon des cercles suivant les nouvelles données.
 *
 * @param json
 *              fichier json comprenant la positions des pays.
 * @param carte
 *              Objet carte pour lequel on veut mettre a jour les cercles
 */
var maj_cercles = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé (sinon problème car cercles triés ensuite par taille) */
    var circle = carte.circlegroupe.selectAll("circle")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    /* la suite... */
    circle.transition()
        .duration(duree_transition)
        /* calcule le rayon du cercle pour que la surface varie avec la valeur */
        .attr("r", function (d) {
            var nbvol = d.properties[carte.dispo + carte.annee];
            return calc_rayon(nbvol);
        })
        /* si la valeur est suffisamment importante, vide le cercle pour qu on ne voit que le contour */
        .attr("class", function (d) {
            var value = d.properties[carte.dispo + carte.annee];
            if (value > evide) {
                return "gros";
            }
        })
        /* trie les cercles en fonction du nb de vol pour mettre les + petits devant */
        .sort(function (a, b) {
            return b.properties[dispo + annee] - a.properties[dispo + annee];
        });
};


var dessin_emprise = function(carte) {


    var pathFile = acronymePays + getYearFolder(carte.annee);
    var file = path_data + pathFile + "/" + pathFile + carte.dispo + ".json";

    // affiche les emprises
    d3.json(file, function (json) {
        var emprises = carte.emprisesgroupe.selectAll("path")
            .data(json.features);
        emprises.enter()
            .append("path")
            .attr("d", path)
            .attr("class", "cl_emprises")
            .style("fill", function (d) {
                var value = d.properties[col_valeur];
                return color(value);
            })
            .style("stroke", "gray")
            .style("stroke-width", stroke_width_empr)
            // trie les emprise en fonction du nb
            .sort(function (a, b) {
                return b.properties[col_valeur] - a.properties[col_valeur];
            });
    });

};

var maj_emprise = function(carte) {

    var pathFile = acronymePays + getYearFolder(carte.annee);
    var file = path_data + pathFile + "/" + pathFile + carte.dispo + ".json";

    //supprime les anciennes emprises.
    carte.emprisesgroupe.selectAll("path").remove();

    // affiche les emprises
    d3.json(file, function (json) {
        if(json != null) {
            var emprises = carte.emprisesgroupe.selectAll("path")
                .data(json.features);
            emprises.enter()
                .append("path")
                .attr("d", path)
                .attr("class", "cl_emprises")
                .style("fill", function (d) {
                    var value = d.properties[col_valeur];
                    return color(value);
                })
                .style("stroke", "gray")
                .style("stroke-width", stroke_width_empr)
                // trie les emprise en fonction du nb
                .sort(function (a, b) {
                    return b.properties[col_valeur] - a.properties[col_valeur];
                });
            carte.div_carte.select("span")
                .html("");
        }
        else{
            carte.div_carte.select("span")
                .html("<b>Donnée non disponible !</b>")
                .style("color", "red");
        }
    });
};


/**
 * Dessine la carte passée en parametre en appelant les fonctions de dessin, et en
 * ce servant des fichiers de données.
 * Ne dessine les cartes que si elle ne sont pas déjà affichée.
 *
 * @param carte
 *             Objet carte à dessiner
 */
var dessin_carte = function (carte) {

    if (carte.isShown == false) {
        /* affiche le planisphère */
        carte.planigroupe.append("path")
            .datum({type: "Sphere"})
            .attr("class", "plani")
            .attr("id", "sphere")
            .attr("d", path);
        //ajout d'un bouton supprimer et de la liste des noms des données.
        configurationCarte(carte);

        /* Chargement des données CSV */
        //d3.csv(path_csv, function (data) {
            /* Chargement des données JSON */
            d3.json(path_json, function (json) {
                /* lie les données CSV pour l année et le dispositif en cours */
                //bind_csv_json(data, json, carte.annee, carte.dispo);
                //affiche la légende
                dessin_Legend(carte);
                dessin_emprise(carte);
                /* affiche les pays, couleur en fonction année et dispositif en cours */
                dessin_pays(json, carte);
                /* dessine les cercles, en fonction année et dispositif en cours */
                //dessin_cercles(json, carte);
                //Synchronise le zoom avec la premiere carte si besoin
                synchroZoom(carte);
            });
       // });
        carte.isShown = true;
    }
};

/**
 *  Met à jour la carte passer a paramètre en appelant les fonctions maj, pour la carte
 *  passée en parametre. En regardant dans les fichiers de données.
 *  Appelé lorsque l'on change la disposition des données ou l'année.
 *
 * @param carte
 *              Objet carte que l'on veut mettre à jour.
 */
var maj_carte = function (carte) {
    /* Chargement des données CSV */
    //d3.csv(path_csv, function (data) {
        /* Chargement des données JSON */
        d3.json(path_json, function (json) {
            /* lie les données CSV pour l année et le dispositif en cours */
           // bind_csv_json(data, json, carte.annee, carte.dispo);
            maj_emprise(carte);
            /* met à jour les pays, couleur en fonction année et dispositif en cours */
            maj_pays(json, carte);
            /* met à jour les cercles, en fonction année et dispositif en cours */
            maj_cercles(json, carte);

        });
    //})
};

/**
 * Ajout d'un bouton supprimer et d'une liste pour la selection des données, pour
 * la carte passée en parametre.
 *
 * @param carte
 *          Objet carte sur lequelle appliquer les modifications.
 */
function configurationCarte(carte){
    //création du bouton supprimer, mais pas pour la premiere carte.
    if (compteurCarte != 0) {
        carte.div_carte.append("input")
            .attr("type", "button")
            .attr("value", "Supprimer")
            .attr("id", carte.id)
            .attr("onclick", "suppressionCarte(this.id);");
    }
    ///ajout d'une liste déroulante sur toute les cartes, contient la liste des différentes données disponible.
    var dataSelect = carte.div_carte.append("select")
        .attr("name", "dataSelect")
        .on("change", function(){
            // met à jour la carte avec les nouvelles données selectionnées.
            //on récupere quelle sont les données selectionnées.
            carte.dispo = getCategories(this.options[this.selectedIndex].value);
            carte.Legend.description = this.options[this.selectedIndex].value;
            //met a jour la légende et la carte correspondante.
            maj_Legend(carte);
            maj_carte(carte);

        });
    //ajout des options pour la liste déroulante.
    for(var i = 0; i<nomCategories.length; i++) {
        dataSelect.append("option")
            .attr("value", nomCategories[i])
            .text(nomCategories[i]);
    }
    //ajout d'un span pour afficher des informations.
    carte.div_carte.append("span");
}
