/* ===========================================================
   Abisal · Generador procedural de preguntas (ES / EN)
   Formato de cada entrada:  "es1/es2=en1/en2|etiqueta|extra"
   El ORDEN de cada lista = popularidad (primero = más común).
   La rareza (metros) se calcula sola a partir de ese orden.
   =========================================================== */
(function (global) {
  'use strict';

  // ---------- Utilidades de texto ----------
  const strip = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const plain = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u0302\u0304-\u036f]/g, '').normalize('NFC');
  const ARTICLES = /^(el|la|los|las|lo|un|una|unos|unas|the|a|an)\s+/;
  const normalize = (s) => strip(s).replace(/[^a-z0-9]+/g, ' ').trim().replace(ARTICLES, '');

  function toKeys(s) {
    const base = normalize(s);
    if (!base) return [];
    const words = base.split(' ');
    const v1 = words.map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w));
    const v2 = words.map((w) => {
      if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
      if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
      return w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
    });
    return [...new Set([base, v1.join(' '), v2.join(' ')].map((k) => k.replace(/\s+/g, '')))];
  }
  const keysOf = (names) => { const set = new Set(); names.forEach((n) => toKeys(n).forEach((k) => set.add(k))); return set; };

  function parseNames(part) {
    const [es, en] = String(part).split('=');
    const list = (x) => String(x).split('/').map((s) => s.trim()).filter(Boolean);
    return { es: list(es), en: list(en ?? es) };
  }

  const metersFor = (i, n) => (n < 2 ? 10 : Math.max(10, Math.round((10 + 3590 * Math.pow(i / (n - 1), 1.35)) / 10) * 10));

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; return h; };

  // ================= BANCOS DE DATOS =================
  const ANIMALS = [
    "Perro=Dog|M","Gato=Cat|M","León=Lion|M","Elefante=Elephant|M","Caballo=Horse|M","Vaca=Cow|M","Tigre=Tiger|M","Mono=Monkey|M","Oso=Bear|M","Jirafa=Giraffe|M",
    "Cerdo/Chancho/Puerco=Pig|M","Conejo=Rabbit/Bunny|M","Ratón=Mouse|M","Lobo=Wolf|M","Zorro=Fox|M","Delfín=Dolphin|M","Ballena=Whale|M","Oveja=Sheep|M","Cebra=Zebra|M","Canguro=Kangaroo|M",
    "Burro/Asno=Donkey|M","Hipopótamo=Hippopotamus/Hippo|M","Rinoceronte=Rhinoceros/Rhino|M","Ardilla=Squirrel|M","Camello=Camel|M","Murciélago=Bat|M","Koala|M","Panda|M","Llama|M","Alpaca|M",
    "Puma=Puma/Cougar|M","Jaguar|M","Gorila=Gorilla|M","Chimpancé=Chimpanzee/Chimp|M","Leopardo=Leopard|M","Hámster=Hamster|M","Ciervo/Venado=Deer|M","Foca=Seal|M","Hiena=Hyena|M","Mapache=Raccoon|M",
    "Nutria=Otter|M","Erizo=Hedgehog|M","Castor=Beaver|M","Vicuña=Vicuna/Vicuña|M","Perezoso=Sloth|M","Armadillo|M","Oso hormiguero=Anteater|M","Tapir|M","Ornitorrinco=Platypus|M","Suricata=Meerkat|M",
    "Lémur=Lemur|M","Okapi|M","Pangolín=Pangolin|M","Narval=Narwhal|M","Equidna=Echidna|M","Quokka|M","Tarsero=Tarsier|M","Uombat/Wombat=Wombat|M","Aye-aye|M",
    "Gallina=Chicken/Hen|A","Paloma=Pigeon/Dove|A","Águila=Eagle|A","Loro=Parrot|A","Pato=Duck|A","Pingüino=Penguin|A","Búho=Owl|A","Avestruz=Ostrich|A","Cóndor=Condor|A","Gaviota=Seagull/Gull|A",
    "Colibrí/Picaflor=Hummingbird|A","Pavo=Turkey|A","Flamenco=Flamingo|A","Cuervo=Crow/Raven|A","Halcón=Falcon/Hawk|A","Canario=Canary|A","Gorrión=Sparrow|A","Tucán=Toucan|A","Cisne=Swan|A","Pelícano=Pelican|A",
    "Pavo real=Peacock|A","Golondrina=Swallow|A","Guacamayo=Macaw|A","Garza=Heron|A","Ganso=Goose|A","Buitre=Vulture|A","Codorniz=Quail|A","Emú=Emu|A","Ñandú=Rhea|A","Cigüeña=Stork|A",
    "Albatros=Albatross|A","Pájaro carpintero/Carpintero=Woodpecker|A","Martín pescador=Kingfisher|A","Quetzal|A","Gallito de las rocas=Cock-of-the-rock|A","Abubilla=Hoopoe|A","Frailecillo=Puffin|A","Casuario=Cassowary|A","Kakapo|A",
    "Serpiente/Culebra=Snake|R","Cocodrilo=Crocodile|R","Tortuga=Turtle/Tortoise|R","Lagartija/Lagarto=Lizard|R","Iguana|R","Caimán=Caiman|R","Camaleón=Chameleon|R","Cobra|R","Boa|R","Anaconda|R",
    "Pitón=Python|R","Dragón de Komodo=Komodo dragon|R","Geco/Gecko=Gecko|R","Víbora=Viper|R","Serpiente de cascabel/Cascabel=Rattlesnake|R","Aligátor=Alligator|R","Basilisco=Basilisk|R","Monstruo de Gila=Gila monster|R","Eslizón=Skink|R","Gavial=Gharial|R","Tuátara=Tuatara|R",
    "Tiburón=Shark|P","Salmón=Salmon|P","Atún=Tuna|P","Pez payaso=Clownfish|P","Piraña=Piranha|P","Trucha=Trout|P","Sardina=Sardine|P","Bagre=Catfish|P","Pez espada=Swordfish|P","Merluza=Hake|P",
    "Bacalao=Cod|P","Carpa=Carp|P","Anguila=Eel|P","Pez globo=Pufferfish/Blowfish|P","Mantarraya/Raya=Stingray/Manta ray/Ray|P","Caballito de mar=Seahorse|P","Barracuda|P","Lenguado=Sole/Flounder|P","Pez dorado/Carpa dorada=Goldfish|P","Anchoveta/Anchoa=Anchovy|P",
    "Rape=Anglerfish/Monkfish|P","Paiche/Arapaima=Arapaima|P","Pez luna=Sunfish/Mola|P","Pez gota=Blobfish|P","Pez linterna=Lanternfish|P","Celacanto=Coelacanth|P","Lamprea=Lamprey|P",
    "Mosca=Fly|I","Hormiga=Ant|I","Abeja=Bee|I","Mariposa=Butterfly|I","Mosquito/Zancudo=Mosquito|I","Cucaracha=Cockroach/Roach|I","Grillo=Cricket|I","Saltamontes=Grasshopper|I","Escarabajo=Beetle|I","Mariquita=Ladybug/Ladybird|I",
    "Libélula=Dragonfly|I","Polilla=Moth|I","Avispa=Wasp|I","Luciérnaga=Firefly|I","Termita=Termite|I","Pulga=Flea|I","Piojo=Louse/Lice|I","Cigarra=Cicada|I","Chinche=Bedbug|I","Mantis/Mantis religiosa=Mantis/Praying mantis|I",
    "Tijereta=Earwig|I","Gorgojo=Weevil|I","Insecto palo=Stick insect|I","Efímera=Mayfly|I","Zapatero=Water strider|I",
    "Rana=Frog|N","Sapo=Toad|N","Salamandra=Salamander|N","Ajolote=Axolotl|N","Tritón=Newt|N","Rana de cristal=Glass frog|N","Rana dardo=Poison dart frog|N","Cecilia=Caecilian|N",
    "Araña=Spider|V","Pulpo=Octopus|V","Caracol=Snail|V","Medusa=Jellyfish|V","Lombriz=Earthworm/Worm|V","Cangrejo=Crab|V","Estrella de mar=Starfish/Sea star|V","Escorpión/Alacrán=Scorpion|V","Calamar=Squid|V","Langosta=Lobster|V",
    "Camarón/Gamba=Shrimp/Prawn|V","Babosa=Slug|V","Erizo de mar=Sea urchin|V","Ciempiés=Centipede|V","Sanguijuela=Leech|V","Garrapata=Tick|V","Almeja=Clam|V","Mejillón=Mussel|V","Ostra=Oyster|V","Tarántula=Tarantula|V",
    "Nautilo=Nautilus|V","Cochinilla=Woodlouse/Pill bug|V","Percebe=Barnacle|V","Tardígrado=Tardigrade/Water bear|V"
  ];

  const COUNTRIES = [
    "Estados Unidos/EEUU/EE UU/USA=United States/USA/US/America|AM|Washington/Washington D.C.","México=Mexico|AM|Ciudad de México/CDMX=Mexico City","Brasil=Brazil|AM|Brasilia=Brasilia/Brasília","Argentina|AM|Buenos Aires","Perú=Peru|AM|Lima",
    "Colombia|AM|Bogotá=Bogota/Bogotá","Chile|AM|Santiago/Santiago de Chile","Canadá=Canada|AM|Ottawa","Venezuela|AM|Caracas","Cuba|AM|La Habana/Habana=Havana","Ecuador|AM|Quito","Bolivia|AM|Sucre/La Paz",
    "Uruguay|AM|Montevideo","Paraguay|AM|Asunción=Asuncion/Asunción","Costa Rica|AM|San José=San Jose/San José","Panamá=Panama|AM|Panamá/Ciudad de Panamá=Panama City","Guatemala|AM|Ciudad de Guatemala/Guatemala=Guatemala City",
    "Honduras|AM|Tegucigalpa","El Salvador|AM|San Salvador","Nicaragua|AM|Managua","República Dominicana=Dominican Republic|AM|Santo Domingo","Jamaica|AM|Kingston","Haití=Haiti|AM|Puerto Príncipe=Port-au-Prince",
    "Bahamas|AM|Nasáu/Nassau=Nassau","Trinidad y Tobago=Trinidad and Tobago|AM|Puerto España=Port of Spain","Belice=Belize|AM|Belmopán=Belmopan","Guyana|AM|Georgetown","Surinam/Suriname=Suriname|AM|Paramaribo",
    "Barbados|AM|Bridgetown","Granada=Grenada|AM|Saint George's/San Jorge=Saint George's","Santa Lucía=Saint Lucia|AM|Castries","Dominica|AM|Roseau",
    "España=Spain|EU|Madrid","Francia=France|EU|París=Paris","Italia=Italy|EU|Roma=Rome","Alemania=Germany|EU|Berlín=Berlin","Reino Unido/Inglaterra=United Kingdom/UK/England/Britain|EU|Londres=London",
    "Portugal|EU|Lisboa=Lisbon","Rusia=Russia|EU|Moscú=Moscow","Grecia=Greece|EU|Atenas=Athens","Países Bajos/Holanda=Netherlands/Holland|EU|Ámsterdam=Amsterdam","Suiza=Switzerland|EU|Berna=Bern",
    "Suecia=Sweden|EU|Estocolmo=Stockholm","Noruega=Norway|EU|Oslo","Bélgica=Belgium|EU|Bruselas=Brussels","Irlanda=Ireland|EU|Dublín=Dublin","Polonia=Poland|EU|Varsovia=Warsaw","Austria|EU|Viena=Vienna",
    "Dinamarca=Denmark|EU|Copenhague=Copenhagen","Finlandia=Finland|EU|Helsinki","Ucrania=Ukraine|EU|Kiev/Kyiv=Kyiv/Kiev","Croacia=Croatia|EU|Zagreb","Chequia/República Checa=Czechia/Czech Republic|EU|Praga=Prague",
    "Hungría=Hungary|EU|Budapest","Rumania/Rumanía=Romania|EU|Bucarest=Bucharest","Islandia=Iceland|EU|Reikiavik/Reykjavik=Reykjavik","Serbia|EU|Belgrado=Belgrade","Bulgaria|EU|Sofía=Sofia",
    "Mónaco=Monaco|EU|Mónaco=Monaco","Vaticano/Ciudad del Vaticano=Vatican City/Vatican|EU|Ciudad del Vaticano/Vaticano=Vatican City","Luxemburgo=Luxembourg|EU|Luxemburgo=Luxembourg","Eslovaquia=Slovakia|EU|Bratislava",
    "Eslovenia=Slovenia|EU|Liubliana/Ljubljana=Ljubljana","Estonia|EU|Tallin=Tallinn","Letonia=Latvia|EU|Riga","Lituania=Lithuania|EU|Vilna/Vilnius=Vilnius","Bielorrusia=Belarus|EU|Minsk","Albania|EU|Tirana",
    "Malta|EU|La Valeta/Valletta=Valletta","Andorra|EU|Andorra la Vieja=Andorra la Vella","San Marino|EU|San Marino","Liechtenstein|EU|Vaduz","Moldavia=Moldova|EU|Chisináu=Chisinau","Montenegro|EU|Podgorica",
    "Macedonia del Norte/Macedonia=North Macedonia/Macedonia|EU|Skopie=Skopje","Bosnia y Herzegovina/Bosnia=Bosnia and Herzegovina/Bosnia|EU|Sarajevo",
    "China|AS|Pekín/Beijing=Beijing/Peking","Japón=Japan|AS|Tokio=Tokyo","India|AS|Nueva Delhi/Delhi=New Delhi/Delhi","Corea del Sur/Corea=South Korea/Korea|AS|Seúl=Seoul","Israel|AS|Jerusalén=Jerusalem",
    "Arabia Saudita/Arabia Saudí=Saudi Arabia|AS|Riad=Riyadh","Tailandia=Thailand|AS|Bangkok","Vietnam|AS|Hanói=Hanoi","Filipinas=Philippines|AS|Manila","Indonesia|AS|Yakarta=Jakarta","Turquía=Turkey/Türkiye|AS|Ankara",
    "Irán=Iran|AS|Teherán=Tehran","Irak=Iraq|AS|Bagdad=Baghdad","Pakistán=Pakistan|AS|Islamabad","Afganistán=Afghanistan|AS|Kabul","Corea del Norte=North Korea|AS|Pionyang=Pyongyang",
    "Emiratos Árabes Unidos/Emiratos=United Arab Emirates/UAE|AS|Abu Dabi=Abu Dhabi","Catar/Qatar=Qatar|AS|Doha","Siria=Syria|AS|Damasco=Damascus","Líbano=Lebanon|AS|Beirut","Jordania=Jordan|AS|Amán=Amman",
    "Singapur=Singapore|AS|Singapur=Singapore","Malasia=Malaysia|AS|Kuala Lumpur","Nepal|AS|Katmandú=Kathmandu","Mongolia|AS|Ulán Bator=Ulaanbaatar/Ulan Bator","Kazajistán=Kazakhstan|AS|Astaná=Astana",
    "Sri Lanka|AS|Sri Jayawardenepura Kotte/Colombo","Bangladés/Bangladesh=Bangladesh|AS|Daca=Dhaka","Camboya=Cambodia|AS|Nom Pen=Phnom Penh","Laos|AS|Vientián=Vientiane","Myanmar/Birmania=Myanmar/Burma|AS|Naipyidó=Naypyidaw",
    "Kuwait|AS|Kuwait/Ciudad de Kuwait=Kuwait City","Omán=Oman|AS|Mascate=Muscat","Yemen|AS|Saná=Sanaa","Uzbekistán=Uzbekistan|AS|Taskent=Tashkent","Bután=Bhutan|AS|Timbu=Thimphu","Maldivas=Maldives|AS|Malé=Male",
    "Baréin/Bahréin=Bahrain|AS|Manama","Georgia|AS|Tiflis=Tbilisi","Armenia|AS|Ereván=Yerevan","Azerbaiyán=Azerbaijan|AS|Bakú=Baku","Tayikistán=Tajikistan|AS|Dusambé=Dushanbe","Kirguistán=Kyrgyzstan|AS|Biskek=Bishkek",
    "Turkmenistán=Turkmenistan|AS|Asjabad=Ashgabat","Brunéi=Brunei|AS|Bandar Seri Begawan","Timor Oriental=East Timor/Timor-Leste|AS|Dili",
    "Egipto=Egypt|AF|El Cairo/Cairo=Cairo","Sudáfrica=South Africa|AF|Pretoria/Ciudad del Cabo=Pretoria/Cape Town","Marruecos=Morocco|AF|Rabat","Nigeria|AF|Abuya=Abuja","Kenia=Kenya|AF|Nairobi",
    "Etiopía=Ethiopia|AF|Adís Abeba=Addis Ababa","Argelia=Algeria|AF|Argel=Algiers","Túnez=Tunisia|AF|Túnez=Tunis","Ghana|AF|Acra=Accra","Senegal|AF|Dakar","Camerún=Cameroon|AF|Yaundé=Yaounde","Angola|AF|Luanda",
    "Mozambique|AF|Maputo","Madagascar|AF|Antananarivo","Tanzania|AF|Dodoma","Uganda|AF|Kampala","Costa de Marfil=Ivory Coast/Côte d'Ivoire|AF|Yamusukro=Yamoussoukro","Libia=Libya|AF|Trípoli=Tripoli",
    "Sudán=Sudan|AF|Jartum=Khartoum","Somalia|AF|Mogadiscio=Mogadishu","Zimbabue=Zimbabwe|AF|Harare","Ruanda=Rwanda|AF|Kigali","Guinea Ecuatorial=Equatorial Guinea|AF|Malabo",
    "República Democrática del Congo=Democratic Republic of the Congo/DR Congo|AF|Kinsasa=Kinshasa","Congo/República del Congo=Republic of the Congo/Congo|AF|Brazzaville","Malí/Mali=Mali|AF|Bamako","Namibia|AF|Windhoek",
    "Botsuana=Botswana|AF|Gaborone","Zambia|AF|Lusaka","Níger=Niger|AF|Niamey","Chad|AF|Yamena=N'Djamena","Cabo Verde=Cape Verde/Cabo Verde|AF|Praia","Mauritania|AF|Nuakchot=Nouakchott","Gabón=Gabon|AF|Libreville",
    "Benín=Benin|AF|Porto Novo","Togo|AF|Lomé=Lome","Burkina Faso|AF|Uagadugú=Ouagadougou","Eritrea|AF|Asmara","Yibuti=Djibouti|AF|Yibuti=Djibouti","Lesoto=Lesotho|AF|Maseru","Esuatini/Suazilandia=Eswatini/Swaziland|AF|Mbabane",
    "Malaui=Malawi|AF|Lilongüe=Lilongwe","Seychelles|AF|Victoria","Comoras=Comoros|AF|Moroni","Santo Tomé y Príncipe=Sao Tome and Principe|AF|Santo Tomé=Sao Tome","Burundi|AF|Gitega","Liberia|AF|Monrovia",
    "Sierra Leona=Sierra Leone|AF|Freetown","Gambia|AF|Banjul","Guinea|AF|Conakri=Conakry","Guinea-Bisáu=Guinea-Bissau|AF|Bisáu=Bissau","Mauricio=Mauritius|AF|Port Louis","Sudán del Sur=South Sudan|AF|Yuba=Juba",
    "República Centroafricana=Central African Republic|AF|Bangui",
    "Australia|OC|Canberra","Nueva Zelanda=New Zealand|OC|Wellington","Fiyi=Fiji|OC|Suva","Papúa Nueva Guinea=Papua New Guinea|OC|Port Moresby","Samoa|OC|Apia","Tonga|OC|Nukualofa=Nuku'alofa",
    "Vanuatu|OC|Port Vila","Islas Salomón=Solomon Islands|OC|Honiara","Kiribati|OC|Tarawa","Micronesia|OC|Palikir","Palaos=Palau|OC|Ngerulmud","Tuvalu|OC|Funafuti","Nauru|OC|Yaren","Islas Marshall=Marshall Islands|OC|Majuro"
  ];

  const FRUITS = [
    "Manzana=Apple","Plátano/Banana/Banano=Banana","Naranja=Orange","Fresa/Frutilla=Strawberry","Uva=Grape","Sandía=Watermelon","Piña/Ananá=Pineapple","Mango","Pera=Pear","Limón=Lemon",
    "Durazno/Melocotón=Peach","Cereza=Cherry","Melón=Melon/Cantaloupe","Kiwi","Papaya","Mandarina=Tangerine/Mandarin","Coco=Coconut","Ciruela=Plum","Frambuesa=Raspberry","Arándano=Blueberry",
    "Higo=Fig","Granada=Pomegranate","Maracuyá/Fruta de la pasión=Passion fruit","Guayaba=Guava","Lima=Lime","Toronja/Pomelo=Grapefruit","Mora=Blackberry","Palta/Aguacate=Avocado","Chirimoya=Cherimoya/Custard apple","Tuna/Higo chumbo=Prickly pear",
    "Membrillo=Quince","Granadilla=Granadilla/Sweet granadilla","Lúcuma=Lucuma","Pitahaya/Pitaya/Fruta del dragón=Dragon fruit/Pitaya","Níspero=Loquat","Caqui/Kaki=Persimmon","Guanábana=Soursop","Carambola=Star fruit/Carambola","Lichi=Lychee/Litchi","Aguaymanto/Uchuva=Goldenberry/Cape gooseberry",
    "Tamarindo=Tamarind","Mangostán=Mangosteen","Rambután=Rambutan","Durián=Durian","Camu camu","Kumquat","Feijoa","Yaca/Jaca=Jackfruit"
  ];

  const VEGGIES = [
    "Lechuga=Lettuce","Tomate=Tomato","Zanahoria=Carrot","Papa/Patata=Potato","Cebolla=Onion","Brócoli=Broccoli","Pepino=Cucumber","Ajo=Garlic","Pimiento/Pimentón/Morrón=Bell pepper/Pepper","Espinaca=Spinach",
    "Coliflor=Cauliflower","Apio=Celery","Zapallo/Calabaza=Pumpkin/Squash","Berenjena=Eggplant/Aubergine","Repollo/Col=Cabbage","Choclo/Maíz/Elote=Corn","Zapallito/Calabacín=Zucchini/Courgette","Rábano=Radish","Betarraga/Remolacha=Beet/Beetroot","Espárrago=Asparagus",
    "Alcachofa=Artichoke","Champiñón/Hongo=Mushroom","Poro/Puerro=Leek","Camote/Batata=Sweet potato","Arveja/Guisante=Pea","Vainita/Judía verde/Ejote=Green bean","Acelga=Chard","Nabo=Turnip","Kale/Col rizada=Kale","Rúcula/Arúgula=Arugula/Rocket",
    "Yuca/Mandioca=Cassava/Yuca","Olluco/Ulluco=Ulluco","Endibia=Endive","Colinabo=Kohlrabi","Chirivía=Parsnip","Okra/Quimbombó=Okra","Hinojo=Fennel","Romanesco","Salicornia=Samphire"
  ];

  const COLORS = [
    "Rojo=Red","Azul=Blue","Verde=Green","Amarillo=Yellow","Negro=Black","Blanco=White","Rosado/Rosa=Pink","Morado/Púrpura=Purple","Naranja/Anaranjado=Orange","Gris=Gray/Grey",
    "Marrón/Café=Brown","Celeste=Sky blue/Light blue","Violeta=Violet","Turquesa=Turquoise","Dorado=Gold/Golden","Plateado=Silver","Beige","Lila=Lilac","Fucsia=Fuchsia","Crema=Cream",
    "Coral","Salmón=Salmon","Granate/Guinda=Maroon","Magenta","Cian=Cyan","Ocre=Ochre/Ocher","Índigo/Añil=Indigo","Burdeos/Borgoña=Burgundy","Caqui=Khaki","Esmeralda=Emerald",
    "Lavanda=Lavender","Mostaza=Mustard","Ámbar=Amber","Terracota=Terracotta","Marfil=Ivory","Bermellón=Vermilion","Carmesí=Crimson","Cerúleo=Cerulean","Sepia","Siena=Sienna",
    "Aguamarina=Aquamarine","Chartreuse","Malva=Mauve","Azul cobalto/Cobalto=Cobalt"
  ];

  const JOBS = [
    "Médico/Doctor=Doctor/Physician","Profesor/Maestro=Teacher","Policía=Police officer/Policeman/Cop","Bombero=Firefighter/Fireman","Abogado=Lawyer/Attorney","Ingeniero=Engineer","Enfermero=Nurse","Cocinero/Chef=Chef/Cook","Arquitecto=Architect","Dentista/Odontólogo=Dentist",
    "Contador=Accountant","Piloto=Pilot","Veterinario=Veterinarian/Vet","Carpintero=Carpenter","Electricista=Electrician","Panadero=Baker","Mecánico=Mechanic","Periodista=Journalist/Reporter","Psicólogo=Psychologist","Albañil=Bricklayer/Builder",
    "Actor=Actor/Actress","Cantante=Singer","Programador=Programmer/Developer","Peluquero=Hairdresser/Barber","Agricultor/Granjero=Farmer","Pintor=Painter","Fotógrafo=Photographer","Gasfitero/Plomero/Fontanero=Plumber","Carnicero=Butcher","Astronauta=Astronaut",
    "Juez=Judge","Bibliotecario=Librarian","Farmacéutico=Pharmacist","Escritor=Writer/Author","Diseñador=Designer","Sastre=Tailor","Cartero=Mail carrier/Postman","Pescador=Fisherman/Fisher","Arqueólogo=Archaeologist","Biólogo=Biologist",
    "Traductor=Translator","Herrero=Blacksmith","Joyero=Jeweler/Jeweller","Relojero=Watchmaker","Apicultor=Beekeeper","Sumiller/Sommelier=Sommelier","Cerrajero=Locksmith","Escultor=Sculptor","Taxidermista=Taxidermist","Ebanista=Cabinetmaker",
    "Deshollinador=Chimney sweep","Lutier/Luthier=Luthier","Cartógrafo=Cartographer","Tonelero=Cooper","Actuario=Actuary"
  ];

  const SPORTS = [
    "Fútbol=Soccer/Football","Básquet/Baloncesto/Básquetbol=Basketball","Tenis=Tennis","Vóley/Voleibol=Volleyball","Natación=Swimming","Béisbol=Baseball","Atletismo=Athletics/Track and field","Boxeo=Boxing","Ciclismo=Cycling","Golf",
    "Rugby","Fútbol americano=American football","Surf=Surfing","Karate/Kárate=Karate","Gimnasia=Gymnastics","Hockey","Pádel=Padel","Judo","Esquí=Skiing","Tenis de mesa/Ping pong=Table tennis/Ping pong",
    "Taekwondo","Patinaje=Skating","Escalada=Climbing","Balonmano/Handball=Handball","Remo=Rowing","Esgrima=Fencing","Polo","Waterpolo=Water polo","Snowboard=Snowboarding","Críquet/Cricket=Cricket",
    "Tiro con arco=Archery","Halterofilia=Weightlifting","Squash","Bádminton=Badminton","Triatlón=Triathlon","Curling","Lacrosse","Bobsleigh=Bobsleigh/Bobsled","Frontón/Pelota vasca=Basque pelota/Jai alai","Skeleton",
    "Sepak takraw","Hurling","Kabaddi"
  ];

  const INSTRUMENTS = [
    "Guitarra=Guitar","Piano","Batería=Drums/Drum kit","Violín=Violin","Flauta=Flute","Trompeta=Trumpet","Saxofón/Saxo=Saxophone/Sax","Tambor=Drum","Bajo=Bass/Bass guitar","Teclado=Keyboard",
    "Arpa=Harp","Ukelele/Ukulele=Ukulele","Acordeón=Accordion","Violonchelo/Chelo=Cello","Clarinete=Clarinet","Trombón=Trombone","Maracas","Pandereta=Tambourine","Armónica=Harmonica","Xilófono=Xylophone",
    "Cajón=Cajon/Cajón","Contrabajo=Double bass/Upright bass","Charango","Quena","Órgano=Organ","Tuba","Triángulo=Triangle","Platillos=Cymbals","Bongó=Bongos","Zampoña/Siku=Panpipes/Pan flute",
    "Gaita=Bagpipes","Banjo","Mandolina=Mandolin","Oboe","Corno francés/Corno=French horn/Horn","Fagot=Bassoon","Marimba","Sitar","Didgeridoo","Theremín/Teremín=Theremin",
    "Zanfona=Hurdy-gurdy","Celesta","Clavecín/Clavicémbalo=Harpsichord","Laúd=Lute","Kalimba","Ocarina","Balalaika","Koto","Erhu"
  ];

  const BODY = [
    "Mano=Hand","Cabeza=Head","Pie=Foot","Ojo=Eye","Brazo=Arm","Pierna=Leg","Nariz=Nose","Boca=Mouth","Oreja=Ear","Dedo=Finger",
    "Corazón=Heart","Rodilla=Knee","Cuello=Neck","Espalda=Back","Pelo/Cabello=Hair","Estómago=Stomach","Uña=Nail/Fingernail","Diente=Tooth/Teeth","Codo=Elbow","Hombro=Shoulder",
    "Lengua=Tongue","Cerebro=Brain","Pulmón=Lung","Hígado=Liver","Riñón=Kidney","Tobillo=Ankle","Muñeca=Wrist","Ceja=Eyebrow","Pestaña=Eyelash","Labio=Lip",
    "Mejilla/Cachete=Cheek","Frente=Forehead","Mentón/Barbilla=Chin","Ombligo=Belly button/Navel","Cadera=Hip","Talón=Heel","Costilla=Rib","Columna=Spine","Páncreas=Pancreas","Bazo=Spleen",
    "Tráquea=Trachea/Windpipe","Clavícula=Collarbone/Clavicle","Esófago=Esophagus/Oesophagus","Rótula=Kneecap/Patella","Fémur=Femur","Tímpano=Eardrum","Úvula/Campanilla=Uvula","Coxis=Tailbone/Coccyx","Esternón=Sternum/Breastbone","Hioides=Hyoid",
    "Estribo=Stapes/Stirrup","Epiglotis=Epiglottis"
  ];

  const HOME = [
    "Mesa=Table","Silla=Chair","Cama=Bed","Sofá/Sillón=Sofa/Couch","Televisor/Televisión/Tele=TV/Television","Lámpara=Lamp","Puerta=Door","Ventana=Window","Espejo=Mirror","Refrigeradora/Refrigerador/Nevera=Fridge/Refrigerator",
    "Reloj=Clock","Almohada=Pillow","Alfombra=Rug/Carpet","Cortina=Curtain","Plato=Plate/Dish","Vaso=Glass","Escoba=Broom","Toalla=Towel","Ropero/Armario/Clóset=Wardrobe/Closet","Inodoro/Wáter=Toilet",
    "Ducha=Shower","Computadora/Ordenador=Computer","Microondas=Microwave","Llave=Key","Florero/Jarrón=Vase","Cojín=Cushion","Perchero=Coat rack","Tostadora=Toaster","Plancha=Iron","Lavadora=Washing machine",
    "Velador/Mesita de noche=Nightstand/Bedside table","Ventilador=Fan","Escalera=Stairs/Ladder","Tacho de basura/Basurero=Trash can/Bin","Cuadro=Painting/Picture","Repisa/Estante=Shelf","Cómoda=Dresser/Chest of drawers","Recogedor=Dustpan","Felpudo=Doormat","Biombo=Folding screen",
    "Atizador=Poker","Candelabro=Candelabrum/Candlestick","Taburete=Stool","Aparador=Sideboard","Puf/Otomana=Ottoman/Pouf"
  ];

  const LANGS = [
    "Español/Castellano=Spanish","Inglés=English","Francés=French","Portugués=Portuguese","Alemán=German","Italiano=Italian","Chino/Mandarín=Chinese/Mandarin","Japonés=Japanese","Ruso=Russian","Árabe=Arabic",
    "Coreano=Korean","Quechua","Hindi","Catalán=Catalan","Latín=Latin","Griego=Greek","Hebreo=Hebrew","Neerlandés/Holandés=Dutch","Aimara/Aymara=Aymara","Guaraní=Guarani",
    "Turco=Turkish","Sueco=Swedish","Polaco=Polish","Euskera/Vasco=Basque","Gallego=Galician","Noruego=Norwegian","Danés=Danish","Finés/Finlandés=Finnish","Tailandés=Thai","Vietnamita=Vietnamese",
    "Suajili/Swahili=Swahili","Esperanto","Náhuatl=Nahuatl","Persa/Farsi=Persian/Farsi","Húngaro=Hungarian","Islandés=Icelandic","Bengalí=Bengali","Tagalo=Tagalog","Galés=Welsh","Maorí=Maori",
    "Zulú=Zulu","Yoruba","Amárico=Amharic","Sánscrito=Sanskrit","Mapudungun","Ainu"
  ];

  const ELEMENTS = [
    "Oxígeno=Oxygen|O","Hidrógeno=Hydrogen|H","Carbono=Carbon|C","Oro=Gold|Au","Hierro=Iron|Fe","Plata=Silver|Ag","Helio=Helium|He","Nitrógeno=Nitrogen|N","Cobre=Copper|Cu","Calcio=Calcium|Ca",
    "Sodio=Sodium|Na","Uranio=Uranium|U","Mercurio=Mercury|Hg","Aluminio=Aluminum/Aluminium|Al","Plomo=Lead|Pb","Zinc|Zn","Potasio=Potassium|K","Cloro=Chlorine|Cl","Neón=Neon|Ne","Litio=Lithium|Li",
    "Platino=Platinum|Pt","Azufre=Sulfur/Sulphur|S","Fósforo=Phosphorus|P","Silicio=Silicon|Si","Magnesio=Magnesium|Mg","Titanio=Titanium|Ti","Flúor=Fluorine|F","Yodo=Iodine|I","Estaño=Tin|Sn","Níquel=Nickel|Ni",
    "Plutonio=Plutonium|Pu","Radio=Radium|Ra","Cobalto=Cobalt|Co","Argón=Argon|Ar","Cromo=Chromium|Cr","Manganeso=Manganese|Mn","Tungsteno/Wolframio=Tungsten|W","Arsénico=Arsenic|As","Bromo=Bromine|Br","Kriptón=Krypton|Kr",
    "Xenón=Xenon|Xe","Radón=Radon|Rn","Boro=Boron|B","Berilio=Beryllium|Be","Cesio=Cesium/Caesium|Cs","Bismuto=Bismuth|Bi","Vanadio=Vanadium|V","Galio=Gallium|Ga","Germanio=Germanium|Ge","Selenio=Selenium|Se",
    "Paladio=Palladium|Pd","Iridio=Iridium|Ir","Osmio=Osmium|Os","Cadmio=Cadmium|Cd","Estroncio=Strontium|Sr","Bario=Barium|Ba","Torio=Thorium|Th","Polonio=Polonium|Po","Itrio=Yttrium|Y","Circonio=Zirconium|Zr",
    "Niobio=Niobium|Nb","Molibdeno=Molybdenum|Mo","Tecnecio=Technetium|Tc","Rodio=Rhodium|Rh","Rutenio=Ruthenium|Ru","Indio=Indium|In","Antimonio=Antimony|Sb","Telurio=Tellurium|Te","Escandio=Scandium|Sc","Lantano=Lanthanum|La",
    "Cerio=Cerium|Ce","Neodimio=Neodymium|Nd","Praseodimio=Praseodymium|Pr","Europio=Europium|Eu","Gadolinio=Gadolinium|Gd","Samario=Samarium|Sm","Prometio=Promethium|Pm","Terbio=Terbium|Tb","Disprosio=Dysprosium|Dy","Holmio=Holmium|Ho",
    "Erbio=Erbium|Er","Tulio=Thulium|Tm","Iterbio=Ytterbium|Yb","Lutecio=Lutetium|Lu","Hafnio=Hafnium|Hf","Tantalio=Tantalum|Ta","Renio=Rhenium|Re","Talio=Thallium|Tl","Astato=Astatine|At","Francio=Francium|Fr",
    "Actinio=Actinium|Ac","Protactinio=Protactinium|Pa","Americio=Americium|Am","Einstenio=Einsteinium|Es","Fermio=Fermium|Fm","Nobelio=Nobelium|No","Nihonio=Nihonium|Nh","Moscovio=Moscovium|Mc","Teneso=Tennessine|Ts","Oganesón=Oganesson|Og"
  ];

  const CONT = {
    AM: { es: 'América', en: 'the Americas' }, EU: { es: 'Europa', en: 'Europe' }, AS: { es: 'Asia', en: 'Asia' },
    AF: { es: 'África', en: 'Africa' }, OC: { es: 'Oceanía', en: 'Oceania' },
  };
  const byCont = (fn) => Object.fromEntries(Object.entries(CONT).map(([k, v]) => [k, { es: fn('es', v.es), en: fn('en', v.en) }]));

  const BANKS = [
    { id: 'animals', grouped: true, data: ANIMALS, cat: { es: 'Animales', en: 'Animals' },
      es: { a: 'un', noun: 'animal' }, en: { a: 'an', noun: 'animal' },
      groups: {
        M: { es: 'un mamífero', en: 'a mammal' }, A: { es: 'un ave', en: 'a bird' }, R: { es: 'un reptil', en: 'a reptile' },
        P: { es: 'un pez', en: 'a fish' }, I: { es: 'un insecto', en: 'an insect' }, N: { es: 'un anfibio', en: 'an amphibian' },
        V: { es: 'un invertebrado que no sea insecto', en: 'an invertebrate that is not an insect' },
      } },
    { id: 'countries', grouped: true, groupLetters: true, data: COUNTRIES, cat: { es: 'Geografía', en: 'Geography' },
      es: { a: 'un', noun: 'país' }, en: { a: 'a', noun: 'country' },
      groups: byCont((l, c) => (l === 'es' ? `un país de ${c}` : `a country in ${c}`)),
      capCat: { es: 'Capitales', en: 'Capitals' },
      capitals: Object.assign({ all: { es: 'la capital de cualquier país', en: 'the capital of any country' } },
        byCont((l, c) => (l === 'es' ? `la capital de un país de ${c}` : `the capital of a country in ${c}`))) },
    { id: 'fruits', data: FRUITS, cat: { es: 'Comida', en: 'Food' }, es: { a: 'una', noun: 'fruta' }, en: { a: 'a', noun: 'fruit' } },
    { id: 'veggies', data: VEGGIES, cat: { es: 'Comida', en: 'Food' }, es: { a: 'una', noun: 'verdura u hortaliza' }, en: { a: 'a', noun: 'vegetable' } },
    { id: 'colors', data: COLORS, cat: { es: 'Colores', en: 'Colors' }, es: { a: 'un', noun: 'color' }, en: { a: 'a', noun: 'color' } },
    { id: 'jobs', data: JOBS, cat: { es: 'Profesiones', en: 'Jobs' }, es: { a: 'una', noun: 'profesión u oficio' }, en: { a: 'a', noun: 'job or profession' } },
    { id: 'sports', data: SPORTS, cat: { es: 'Deportes', en: 'Sports' }, es: { a: 'un', noun: 'deporte' }, en: { a: 'a', noun: 'sport' } },
    { id: 'instruments', data: INSTRUMENTS, cat: { es: 'Música', en: 'Music' }, es: { a: 'un', noun: 'instrumento musical' }, en: { a: 'a', noun: 'musical instrument' } },
    { id: 'body', data: BODY, cat: { es: 'Cuerpo humano', en: 'Human body' }, es: { a: 'una', noun: 'parte del cuerpo humano' }, en: { a: 'a', noun: 'part of the human body' } },
        { id: 'home', data: HOME, cat: { es: 'Hogar', en: 'Home' }, es: { a: 'un', noun: 'objeto de la casa' }, en: { a: 'a', noun: 'household object' } },
    { id: 'languages', data: LANGS, cat: { es: 'Idiomas', en: 'Languages' }, es: { a: 'un', noun: 'idioma' }, en: { a: 'a', noun: 'language' } },
    { id: 'elements', symbols: true, data: ELEMENTS, cat: { es: 'Ciencia', en: 'Science' }, es: { a: 'un', noun: 'elemento químico' }, en: { a: 'a', noun: 'chemical element' } },
  ];

  // ================= CONSTRUCCIÓN =================
  const VERBS = { es: ['Nombra', 'Di', 'Menciona', 'Escribe'], en: ['Name', 'Give me', 'Think of', 'Type'] };
  const RARE = { es: ['z', 'j', 'ñ', 'x', 'k', 'v', 'w', 'll', 'q', 'h'], en: ['z', 'j', 'x', 'k', 'q', 'v', 'w', 'y', 'ph', 'sh'] };
  const MIN = 6;
  const cache = {};

  function parseBank(b) {
    const items = b.data.map((line) => {
      const [n, tag = '', extra] = line.split('|');
      return { names: parseNames(n), tag, extra: extra ? parseNames(extra) : null };
    });
    const group = (it) => (b.grouped ? it.tag : '');
    const total = {}; const seen = {};
    items.forEach((it) => { total[group(it)] = (total[group(it)] || 0) + 1; });
    items.forEach((it) => {
      const k = group(it);
      seen[k] = (seen[k] ?? -1) + 1;
      it.pop = total[k] > 1 ? seen[k] / (total[k] - 1) : 0;
    });
    return items;
  }

  const letters = (s) => plain(s).replace(/[^a-zñ]/g, '');
  const firstLetter = (s) => letters(s)[0] || '';

  function buildPool(lang) {
    if (cache[lang]) return cache[lang];
    const out = [];
    const q = (s) => (lang === 'es' ? `«${s.toUpperCase()}»` : `“${s.toUpperCase()}”`);

    const add = (id, cat, tail, entries, min = MIN) => {
      const list = entries.filter(Boolean);
      if (list.length < min) return;
      list.sort((a, b) => a.pop - b.pop);
      const n = list.length;
      out.push({
        id, source: 'gen', category: cat,
        prompt: `${VERBS[lang][hash(id) % VERBS[lang].length]} ${tail}`,
        answers: list.map((e, i) => ({ id: i, text: e.text, keys: e.keys, meters: metersFor(i, n) })),
      });
    };
    const agn = (it, names = it.names) => ({ text: names[lang][0], keys: keysOf([...names.es, ...names.en]), pop: it.pop });
    const spec = (it, pred) => {
      const ok = it.names[lang].filter(pred);
      return ok.length ? { text: ok[0], keys: keysOf(ok), pop: it.pop } : null;
    };

    for (const b of BANKS) {
      const items = b.items || (b.items = parseBank(b));
      const W = b[lang];
      const cat = b.cat[lang];
      const noun = `${W.a} ${W.noun}`;
      const base = `g:${lang}:${b.id}`;
      const n = items.length;

      add(`${base}:all`, cat, noun, items.map((it) => agn(it)));

      const initials = new Set(items.flatMap((it) => it.names[lang].map(firstLetter)).filter(Boolean));
      for (const L of initials) {
        const entries = items.map((it) => spec(it, (nm) => firstLetter(nm) === L)).filter(Boolean);
        if (entries.length > n * 0.6) continue;
        add(`${base}:start:${L}`, cat, lang === 'es' ? `${noun} que empiece por ${q(L)}` : `${noun} that starts with ${q(L)}`, entries);
      }

      for (let len = 3; len <= 14; len++) {
        const entries = items.map((it) => spec(it, (nm) => letters(nm).length === len)).filter(Boolean);
        if (entries.length > n * 0.5) continue;
        add(`${base}:len:${len}`, cat, lang === 'es' ? `${noun} de exactamente ${len} letras` : `${noun} with exactly ${len} letters`, entries);
      }

      for (const L of RARE[lang]) {
        const entries = items.map((it) => spec(it, (nm) => letters(nm).includes(L))).filter(Boolean);
        if (entries.length > n * 0.6) continue;
        add(`${base}:has:${L}`, cat, lang === 'es' ? `${noun} que lleve ${q(L)}` : `${noun} containing ${q(L)}`, entries);
      }

      if (b.groups) {
        for (const [tag, label] of Object.entries(b.groups)) {
          const grp = items.filter((it) => it.tag === tag);
          add(`${base}:grp:${tag}`, cat, label[lang], grp.map((it) => agn(it)));
          if (!b.groupLetters) continue;
          const ini = new Set(grp.flatMap((it) => it.names[lang].map(firstLetter)).filter(Boolean));
          for (const L of ini) {
            const entries = grp.map((it) => spec(it, (nm) => firstLetter(nm) === L));
            add(`${base}:grp:${tag}:${L}`, cat, lang === 'es' ? `${label[lang]} que empiece por ${q(L)}` : `${label[lang]} that starts with ${q(L)}`, entries, 5);
          }
        }
      }

      if (b.capitals) {
        for (const [tag, label] of Object.entries(b.capitals)) {
          const grp = items.filter((it) => it.extra && (tag === 'all' || it.tag === tag));
          add(`${base}:cap:${tag}`, b.capCat[lang], label[lang], grp.map((it) => agn(it, it.extra)));
        }
      }

      if (b.symbols) {
        add(`${base}:sym1`, cat, lang === 'es' ? `${noun} cuyo símbolo sea una sola letra` : `${noun} whose symbol is a single letter`,
          items.filter((it) => it.tag.length === 1).map((it) => agn(it)));
        for (const S of new Set(items.map((it) => it.tag[0]))) {
          add(`${base}:sym:${S}`, cat, lang === 'es' ? `${noun} cuyo símbolo empiece por ${q(S)}` : `${noun} whose symbol starts with ${q(S)}`,
            items.filter((it) => it.tag[0] === S).map((it) => agn(it)), 5);
        }
      }
    }

    out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    cache[lang] = out;
    return out;
  }

  global.AbisalGen = { buildPool, toKeys, keysOf, parseNames, metersFor, rng, plain };
})(window);
