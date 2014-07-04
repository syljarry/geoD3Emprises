/**
 * Création des premiers éléments comme la fleche des années.
 * Ajout des listener sur les ronds des années et sur les boutons radio.
 * Creation de la premiere carte.
 *
 * @author Sylvain JARRY
 */

/* affiche une ligne (rectangle) pour les années */
var ligne = svg_y.append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", wy - 20)// -20 pour ne pas dépasser de la fleche.
    .attr("height", 4)
    .attr("fill", "darkgray");
/* affiche un triangle tout en haut de la ligne pour en faire une flèche */
svg_y.append('path')
    .attr("class", "triangle")
    .attr('d', function () {
        var x = wy - 3, y = 12;
        return 'M ' + x + ' ' + y + ' l -10 5 l 0 -10 z';
    });

/* affiche les étiquettes des années */
svg_y.selectAll("text")
    .data(annees_labels)
    .enter()
    .append("text")
    .text(function (d) {
        return (d);
    })
svg_y.selectAll("text")
    .data(annees)
    .attr("x", (function (d) {
        return xScale(d) + 10;
    })) // +10 de padding pour que le texte ne sois pas sur les ronds.
    .attr("y", 10)
    .attr("font-weight", "bold")
    .attr("fill", "grey");

/* affiche les années sous forme de ronds */
svg_y.selectAll("circle")
    .data(annees)
    .enter()
    .append("circle")
    .attr("class", function (d) {
        if (d <= annees[0]) {
            return "yearselect";
        } else {
            return "year";
        }
    })
    .attr("cx", function (d) {
        return xScale(d);
    })
    .attr("cy", 10)
    .attr("r", 8)
svg_y.selectAll("circle")
    .data(annees_labels)
    .text(function (d) {
        return (d);
    }) // attribue comme texte l année, pour facilement la récupérer avec la fonction getYear()

    /* si on clique sur une année, actualise les données en fonction de l année */
    .on("click", function () {

        /* réinitialise le style de tous les cercles années */
        svg_y.selectAll("circle")
            .attr("class", "year");

        /* change le style du cercle année cliqué */
        d3.select(this)
            .attr("class", "yearselect");

        /* redessine la carte, on actualise toute les cartes */
        for (var i = 0; i < tableauCarte.length; i++) {
            /* récupère les paramètres */
            tableauCarte[i].annee = getYear();
            maj_Legend(tableauCarte[i]);
            maj_carte(tableauCarte[i]);
        }


    });

/* quand on clique sur les boutons tous, sci, sve...
d3.selectAll(".rd")
    .on("click", function () {

        // récupère les paramètres
        tableauCarte[0].dispo = getDispo();
        tableauCarte[0].Legend.description = getDescription();

        //met à jour la légende uniquement pour la premiere carte.
        maj_Legend(tableauCarte[0]);

        //redessine la carte, on actualise que la premiere carte
        maj_carte(tableauCarte[0]);

    });
*/
/*Création de la premiere carte */
creationNewCarte();
