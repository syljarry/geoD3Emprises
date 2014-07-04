/**
 * Liaison des données entre csv et Json, utilisé pour la lecture et
 * la représentation des données.
 *
 * @author Sylvain JARRY
 */

/**
 * Lie les données CSV au json
 *
 * @param data
 * @param json
 * @param annee
 * @param dispo
 */
var bind_csv_json = function (data, json, annee, dispo) {

    /* initializes all data to 0 in geojson */
    for (var j = 0; j < json.features.length; j++) {
        json.features[j].properties[dispo + annee] = 0;
    }

    /* Merge the ag. data and GeoJSON */
    /* Loop through once for each ag. data value */
    for (var i = 0; i < data.length; i++) {

        /* Grab state code */
        var dataState = data[i][colonne_code];

        /* Grab data value, and convert from string to float */
        var dataValue = parseFloat(data[i][dispo + annee]);

        /* Find the corresponding state inside the GeoJSON */
        for (var h = 0; h < json.features.length; h++) {

            var jsonState = json.features[h].properties[colonne_code];

            if (dataState == jsonState) {

                /* Copy the data value into the JSON */
                json.features[h].properties[dispo + annee] = dataValue;

                /* Stop looking through the JSON */
                break;

            }
        }
    }
};

