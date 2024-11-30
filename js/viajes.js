class Viajes {

    constructor() {
        this.accessToken = 'pk.eyJ1IjoiYWxpY2lhZnAxNSIsImEiOiJjbGdzMnZweWowZWEyM2NvYWZkODMxZXpoIn0.ghWod73o3jm9F1lPOhfsjw'; // Reemplaza con tu token de Mapbox
        navigator.geolocation.getCurrentPosition(this.getPosicion.bind(this), this.verErrores.bind(this));

    }

    getPosicion(posicion) {
        this.mensaje = "Petición de geolocalización realizada con éxito";

        this.longitud = posicion.coords.longitude;
        this.latitud = posicion.coords.latitude;
        this.precision = posicion.coords.accuracy;
        this.altitud = posicion.coords.altitude;
        this.precisionAltitud = posicion.coords.altitudeAccuracy;
        this.rumbo = posicion.coords.heading;
        this.velocidad = posicion.coords.speed;

        this.permisoConcedido = true;

        this.getMapaDinamicoMapBox();
    }

    verErrores(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.mensaje = "El usuario no permite la petición de geolocalización"
                break;
            case error.POSITION_UNAVAILABLE:
                this.mensaje = "Información de geolocalización no disponible"
                break;
            case error.TIMEOUT:
                this.mensaje = "La petición de geolocalización ha caducado"
                break;
            case error.UNKNOWN_ERROR:
                this.mensaje = "Se ha producido un error desconocido"
                break;
        }

        this.permisoConcedido = false;
    }


    cargarMapaEstatico() {
        if (this.permisoConcedido) {


            var mapaEstatico = document.createElement("img");

            var api_token = "pk.eyJ1IjoiYWxpY2lhZnAxNSIsImEiOiJjbGdzMnZweWowZWEyM2NvYWZkODMxZXpoIn0.ghWod73o3jm9F1lPOhfsjw";
            var zoom = 15; // zoom: 1 (el mundo), 5 (continentes), 10 (ciudad), 15 (calles), 20 (edificios)
            var tamMapa = "600x500"; // se define el tamaño en pixeles
            var colorPin = "ff0000";

            var api_url = "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/"
                + "pin-s+" + colorPin
                + "(" + this.longitud + "," + this.latitud + ")/"
                + this.longitud + ","
                + this.latitud + ","
                + zoom + ",0/"
                + tamMapa
                + "?access_token=" + api_token;



            mapaEstatico.setAttribute("src", api_url);
            mapaEstatico.setAttribute("alt", "Mapa geográfico de tu ubicación actual");

            var seccionEstatico = $("main>section[data-element='estatico']");
            seccionEstatico.append(mapaEstatico);





        } else {
            var parrafoPermisoNoConcedido = document.createElement("p");
            var textoPermisoNoConcedido = document.createTextNode("Permiso de ubicación denegado, no se ha podido cargar el mapa estático");
            parrafoPermisoNoConcedido.appendChild(textoPermisoNoConcedido);
            document.querySelector("main").appendChild(parrafoPermisoNoConcedido);

            const parrafo = $('<p>');
            const mensaje = "<h3> Permiso de ubicación denegado</h3>"
            parrafo.append(mensaje);
        }

        //elimina el botón que obtiene el mapa
        document.querySelector("section[data-element='estatico'] input[type='button']").remove();

    }


    getMapaDinamicoMapBox() {


        var lng = parseFloat(this.longitud);
        var lat = parseFloat(this.latitud)
        mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpY2lhZnAxNSIsImEiOiJjbGdzMnZweWowZWEyM2NvYWZkODMxZXpoIn0.ghWod73o3jm9F1lPOhfsjw';
        const map = new mapboxgl.Map({
            container: 'mapaDinamico', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [lng, lat], // starting position [lng, lat]
            zoom: 9, // starting zoom

        });
        // no necesito añadir el mapa al DOM si ya tengo el contenedor

        // añadir marcador de posicion
        const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map);
    }


    procesarXml(files) {
        const file = files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const contenidoXml = e.target.result;
                const contenidoHtml = this.parsearXmlAHtml(contenidoXml);
                $("main>section[data-element='zonaXML']").append(contenidoHtml);


            };

            reader.readAsText(file);
        }
    }

    parsearXmlAHtml(contenidoXml) {
        const xmlDoc = $.parseXML(contenidoXml);
        const $xml = $(xmlDoc);
        console.log($xml)

        let html = "";

        // Extraer los datos principales del circuito
        const datos = $xml.find("datos");
        const nombre = datos.find("nombre").text();
        const longitud = datos.find("longitud").text();
        const anchuraMed = datos.find("anchuraMed").text();
        const fecha = datos.find("fecha").text();
        const hora = datos.find("hora").text();
        const nVueltas = datos.find("nVueltas").text();
        const localidad = datos.find("localidad").text();
        const pais = datos.find("pais").text();

        // Procesar las referencias como enlaces <a>
        var cont=1;
        const referencias = datos.find("referencias referencia").map(function () {
            const url = $(this).text();
            const title = `Referencia ${cont}`;  // Título dinámico con el valor de cont
            cont++;  // Incrementar el contador para la siguiente referencia
            return `<li><a href="${url}" title="${title}">${url}</a></li>`;
        }).get().join(""); 
        

        const fotografia = datos.find("fotografias foto").text(); // Si hay fotografía asociada al circuito
        const coordenadas = datos.find("coordenadas");
        const longitudCircuito = coordenadas.find("longitudCircuito").text();
        const latitudCircuito = coordenadas.find("latitudCircuito").text();
        const altitudCircuito = coordenadas.find("altitudCircuito").text();

        html += `
            <article>
                <h4>${nombre} - Circuito</h4>
                <p>Localidad: ${localidad}, ${pais}</p>
                <p>Longitud: ${longitud} km</p>
                <p>Ancho medio: ${anchuraMed} m</p>
                <p>Fecha: ${fecha}</p>
                <p>Hora: ${hora}</p>
                <p>Vueltas: ${nVueltas}</p>
                <p>Referencias: </p>
                <ul>${referencias}</ul>
                <p>Coordenadas del Circuito: (${latitudCircuito}, ${longitudCircuito}) a ${altitudCircuito} m</p>
                <p>Fotografía: ${fotografia}</p>
        `;


        // Procesar los tramos
        $xml.find("tramos tramo").each((index, tramo) => {
            const dist = $(tramo).find("dist").text();
            const distUnidad = $(tramo).attr("distUnidad");
            const nSector = $(tramo).find("nSector").text();

            const coordenadasTramo = $(tramo).find("coordenadasTramo");
            const longitudTramo = coordenadasTramo.find("longitudTramo").text();
            const latitudTramo = coordenadasTramo.find("latitudTramo").text();
            const altitudTramo = coordenadasTramo.find("altitudTramo").text();

            html += `
            <section>
                <h5>Tramo ${index + 1}</h5>
                <p>Distancia: ${dist} ${distUnidad}</p>
                <p>Coordenadas del Tramo: (${latitudTramo}, ${longitudTramo}) a ${altitudTramo} m</p>
                <p>Número de sector: ${nSector}</p>
            </section>
        `;
        });

        html += `</article>`


        return html;
    }





}