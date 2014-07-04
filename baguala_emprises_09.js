//------------------------------------------------------------
//------------------- Variables du script --------------------
//------------------------------------------------------------


    var fond = "data/fond_pays.json"; // chemin du fond de carte JSON rapport au fichier html

// pour les dates 
    var dates = [0, 1, 2, 3, 4];
    var dates_labels = ["avr 2013", "juil 2013", "oct 2013", "jan 2014", "avr 2014"];
    var dates_chemins = ["data/bo_2013_04_cat.json", "data/bo_2013_07_cat.json", "data/bo_2013_10_cat.json", "data/bo_2014_01_cat.json"];

// pour les catégories 
    var cats = [0, 1, 2, 3];
    var cats_labels = ["catA", "catB", "catC", "catD"];

// catégories initialement sélectionnées 
    lcatselect = [];

// Largeur et longueur de la carte (correspond à largeur et longueur du div_map) 
    var width = 800;
    var height = 400;

// largeur de la légende (correspond à largeur du div legende) 
    var width_leg = 120;
    var height_leg = 240;

// largeur et hauteur de l élément pour les dates 
    var width_date = 150;
    var height_date = 400;

// largeur et hauteur de l élément pour les catégories 
    var width_cat = 100;
    var height_cat = 100;

// largeur et hauteur des carrés de la légende 
    var ls_w = 20;
    var ls_h = 20;

// min et max possible en zoomant (plus maxzoom est élevé, plus on peut zoomer) 
    var minzoom = 1;
    var maxzoom = 50;

// centre de la carte et échelle pour la vue initiale (ici, Bolivie) 
    var centre = [-65, -15];
    var echelle = 800;

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
    var legend_labels = ["1 - 16", "16 - 30", "30 - 198", "198 - 224", "224 - 230", "230 - 250", "250 - 268", "268 - 296", "296 - 318"] // étiquettes de la légende
    var titre_leg = "Nb emprises"; // titre de la légende

// largeur des bordures de pays et des emprises 
    var stroke_width_pays = 1;
    var stroke_width_empr = 0;

// fonction zoom 
    var zoom = d3.behavior.zoom()
        .scaleExtent([minzoom, maxzoom])
        .on("zoom", move);

// pour les couleurs de la carte choroplèthe 
    var color = d3.scale.threshold()
        .domain(color_domain)
        .range(color_range);

// padding pour que les ronds des années ne dépassent pas 
    var padding = 20;

// crée une échelle pour la représentation des années 
    var yScale = d3.scale.linear()
        // input domain : entre min et max des années
        .domain([d3.max(dates, function (d) {
            return d;
        }), d3.min(dates, function (d) {
            return d;
        })])
        // output range : entre 0 et hauteur de l élément, + padding
        .range([25 + 2 * padding, height_date - 2 * padding]);

// crée une échelle pour la représentation des catégories 
    var catScale = d3.scale.linear()
        // input domain : entre min et max des catégories
        .domain([d3.max(cats, function (d) {
            return d;
        }), d3.min(cats, function (d) {
            return d;
        })])
        // output range : entre hauteur de l élément et 0, + padding
        .range([height_cat - padding, 0 + padding]);


//------------------------------------------------------------
//---------- Les différents éléments SVG et groupes ----------
//------------------------------------------------------------

// Element SVG pour la carte, dans le div_map 
    var svg_map = d3.select("#div_map")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .append("g");

// sous groupe pour les emprises métadonnées de la carte 
    var emprisesgroupe = svg_map.append("g");
// sous groupe pour les pays de la carte 
    var paysgroupe = svg_map.append("g");
// sous groupe pour le planisphère (ces sous-groupes permettent que le planisphère soit toujours affiché en dernier, sinon à chaque mise à jour il repasse dessous) 
    var planigroupe = svg_map.append("g");

// Element SVG pour la légende, dans le div_legende 
    var svg_legende = d3.select("#div_legende")
        .append("svg")
        .attr("width", width_leg)
        .attr("height", height_leg);

// élément svg pour les années 
    var svg_date = d3.select("#div_date")
        .append("svg")
        .attr("width", width_date)
        .attr("height", height_date);

// élément svg pour les catégories 
    var svg_cat = d3.select("#div_cat")
        .append("svg")
        .attr("width", width_cat)
        .attr("height", height_cat);


//------------------------------------------------------------
//------------------------ Fonctions -------------------------
//------------------------------------------------------------

// pour savoir quelle année est sélectionnée 
    var getdate = function () {
        var date = d3.select(".dateselect").text();
        return date;
    }

// pour savoir quelle(s)) catégories sont sélectionnées 
    var getcats = function (catselect) {
        catselect.push(d3.select(".catselect").text());
        return catselect;
    }

// pour mettre à jour la carte quand on change de date 
    var maj_carte = function (date) {
        d3.json(dates_chemins[date], function (json) {
            emprisesgroupe.selectAll("path")
                .data([])
                .remove()
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "cl_emprises")
                .style("fill", function (d) {
                    var value = d.properties[col_valeur];
                    return color(value);
                })
                .style("stroke", "gray")
                // définit la largeur de bordure en fonction du zoom en cours
                .style("stroke-width", function (d) {
                    return stroke_width_empr / zoom.scale()
                });
        });
    }


//------------------------------------------------------------
//------------- Le début du code proprement dit --------------
//------------------------------------------------------------

// affiche le slider pour le zoom 
    d3.select("#div_slider").call(d3.slider().orientation("vertical"));


    setup(width, height);

    function setup(width, height) {
        projection = d3.geo.robinson()
            .translate([(width / 2), (height / 2)])
            .scale(width / 2 / Math.PI);

        // On crée un nouvel objet path qui traduit le GeoJSON en SVG
        path = d3.geo.path()
            .projection(projection);
    }

// centre la carte, définit l échelle 
    projection
        .scale(echelle)
        .center(centre);

// quand on clique que le bouton pour revenir au zoom initial (home) 
    d3.select(p_home)
        .on("click", function () {
            console.log("let's go home!")
            console.log("echelle : ", echelle)
            console.log("centre : ", centre)

            svg_map.attr("transform", "translate([0,0])scale(800)")
            svg_map.zoom.scale(800)
            svg_map.zoom.translate([0, 0]);
        });

// affiche les étiquettes des catégories 
    svg_cat.selectAll("text")
        .data(cats)
        .enter()
        .append("text")
        .text(function (d) {
            return (cats_labels[d]);
        })
        .attr("x", 47)
        .attr("y", function (d) {
            return catScale(d) + 5;
        })
        .attr("class", "cat");

// affiche les catégories sous forme de ronds 
    svg_cat.selectAll("circle")
        .data(cats)
        .enter()
        .append("circle")
        .attr("class", "catnoselect")
        .attr("cx", 32)
        .attr("cy", function (d) {
            return catScale(d);
        })
        .attr("r", 5)
        .text(function (d) {
            return (d);
        }) // attribue comme texte la catégorie

// quand on clique sur une cat non sélectionnée, la sélectionne, et inversement 
        .on("click", function () {
            d3.select(this)
                .attr("class", function () {
                    // si la cat est sélectionnée, la désélectionne
                    if (this.className.baseVal == "catselect") {
                        var index = lcatselect.indexOf(d3.select(this).text())
                        lcatselect.splice(index, 1)
                        return "catnoselect";
                    }
                    // si la cat n est pas sélectionnée, la sélectionne
                    if (this.className.baseVal == "catnoselect") {
                        lcatselect.push(d3.select(this).text())
                        return "catselect";
                    }
                })
            // récupère les cats
            console.log("lcatselect " + lcatselect);
        })


// affiche le planisphère 
    var planisphere = planigroupe.append("path")
        .datum({type: "Sphere"})
        .attr("class", "plani")
        .attr("id", "sphere")
        .attr("d", path);

// affiche les pays 
    d3.json(fond, function (json) {
        paysgroupe.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("class", "cl_pays")
            .attr("d", path)
            .style("stroke", "gray")
            .style("stroke-width", stroke_width_pays);
    });

// affiche les emprises 
    d3.json(dates_chemins[0], function (json) {
        emprisesgroupe.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "cl_emprises")
            .style("fill", function (d) {
                var value = d.properties[col_valeur];
                return color(value);
            })
            .style("stroke", "gray")
            .style("stroke-width", stroke_width_empr);
    });

// pour le zoom molette et le pan 
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        zscale = s;

        t[0] = Math.min(
                (width / height) * (s - 1),
            Math.max(width * (1 - s), t[0])
        );

        t[1] = Math.min(
            0,
            Math.max(height * (1 - s), t[1])
        );

        zoom.translate(t);
        svg_map.attr("transform", "translate(" + t + ")scale(" + s + ")");

        // ajuste la largeur des bordures en fonction du niveau de zoom
        paysgroupe.selectAll("path").style("stroke-width", stroke_width_pays / s);
        emprisesgroupe.selectAll("path").style("stroke-width", stroke_width_empr / s);

    }

// Légende pour la carte choroplèthe 

    var legend = svg_legende.selectAll("g.legend")
        .data(color_domain)
        .enter()
        .append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", 20)
        .attr("y", function (d, i) {
            return height_leg - (i * ls_h) - 2 * ls_h;
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
        .attr("x", 20)
        .attr("y", function (d) {
            return height_leg - (color_domain.length * ls_h) - ls_h - 10;
        })
        .text(titre_leg);

    legend.append("text")
        .attr("x", 50)
        .attr("y", function (d, i) {
            return height_leg - (i * ls_h) - ls_h - 4;
        })
        .text(function (d, i) {
            return legend_labels[i];
        });

// affiche une ligne (rectangle) pour les années 
    var ligne = svg_date.append("rect")
        .attr("x", 30)
        .attr("y", 25)
        .attr("width", 4)
        .attr("height", 375)
        .attr("class", "ligne")
// affiche un triangle tout en haut de la ligne pour en faire une flèche 
    svg_date.append('path')
        .attr("class", "triangle")
        .attr('d', function (d) {
            var x = 32, y = 25;
            return 'M ' + x + ' ' + y + ' l 5 10 l -10 0 z';
        });

// affiche les étiquettes des années 
    svg_date.selectAll("text")
        .data(dates)
        .enter()
        .append("text")
        .text(function (d) {
            return (dates_labels[d]);
        })
        .attr("x", 47)
        .attr("y", function (d) {
            return yScale(d);
        })
        .attr("class", "date");

// affiche les années sous forme de ronds 
    svg_date.selectAll("circle")
        .data(dates)
        .enter()
        .append("circle")
        .attr("class", function (d) {
            if (d <= dates[0]) {
                return "dateselect";
            } else {
                return "date";
            }
        })
        .attr("cx", 32)
        .attr("cy", function (d) {
            return yScale(d);
        })
        .attr("r", 8)
        .text(function (d) {
            return (d);
        }) // attribue comme texte l'année, pour facilement la récupérer avec la fonction getdate()

        // si on clique sur une année, actualise les données en fonction de l année
        .on("click", function () {

            // réinitialise le style de tous les cercles années
            svg_date.selectAll("circle")
                .attr("class", "date");

            // change le style du cercle année cliqué
            d3.select(this)
                .attr("class", "dateselect");

            // récupère l année
            date = getdate();

            // supprime les emprises MD de l ancienne année
            //var ex_emprises = emprisesgroupe.selectAll("path")
            //	.data([])
            //ex_emprises.exit().remove()

            // redessine la carte
            maj_carte(date);

        });

