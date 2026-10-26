// Diagramas nativos editables: responsabilidades, contratos y límites reales.
export const diagrams = {
  "core": {
    "layout": [
      {
        "text": "Entrada HTTP\nJSON y validación",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Caso de uso\nCoordina la operación",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Dominio\nBORRADOR / ENVIADA",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Sistema externo\nPostgreSQL o API",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Adaptador de salida\nJPA o cliente HTTP",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Puerto de salida\nContrato del dominio",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "La entrada llama al caso de uso directamente en ARKA-Lite. Los puertos de salida permiten sustituir mecanismos."
  },
  "query": {
    "layout": [
      {
        "text": "GET /solicitudes/{id}\nSolicitudController",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "ServicioDeSolicitudes\nbuscar(id)",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "RepositorioDeSolicitudes\nContrato de búsqueda",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "JSON al cliente\nDatos o ausencia",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "PostgreSQL + entidad\nFila / SolicitudEntity",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "RepositorioJpa\nInvoca Spring Data",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Consulta: el adaptador convierte entidades en objetos del dominio. El controlador serializa el resultado a JSON."
  },
  "dependencies": {
    "layout": [
      {
        "text": "ServicioDeSolicitudes\nPolítica del negocio",
        "box": [
          70,
          250,
          315,
          115
        ],
        "core": true
      },
      {
        "text": "RepositorioDeSolicitudes\nInterfaz del dominio",
        "box": [
          480,
          250,
          325,
          115
        ]
      },
      {
        "text": "RepositorioJpa\nTecnología de salida",
        "box": [
          900,
          250,
          310,
          115
        ]
      },
      {
        "text": "Prueba con memoria\nMismo contrato esperado",
        "box": [
          480,
          440,
          325,
          100
        ]
      }
    ],
    "links": [
      [
        0,
        1,
        "usa"
      ],
      [
        2,
        1,
        "implementa",
        "left",
        "right",
        825,
        210
      ],
      [
        3,
        1,
        "sustituye",
        "top",
        "bottom",
        825,
        420
      ]
    ],
    "caption": "Las flechas muestran dependencias de código. Spring inyecta el adaptador concreto en ejecución."
  },
  "transaction": {
    "layout": [
      {
        "text": "POST enviar\nID de la solicitud",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "ServicioDeSolicitudes\nValida el borrador",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Solicitud ENVIADA\nNuevo estado",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Respuesta al cliente\nRegistro confirmado",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Commit / rollback\nUna transacción local",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Outbox en PostgreSQL\neventoId + pendiente",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Frontera transaccional: solicitud y outbox en la misma base. La respuesta todavía no confirma la entrega del aviso."
  },
  "delivery": {
    "layout": [
      {
        "text": "Outbox persistente\nprocesado = false",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Relevador programado\n5 s entre ciclos",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Publicador HTTP\nHasta 3 intentos",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Outbox actualizado\nÉxito: procesado=true",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Resultado del receptor\nÉxito o excepción",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "POST del evento\nMismo eventoId",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Fallo: el pendiente se conserva para otro ciclo. Las pausas de reintento son 500 y 1.000 ms, sin plazo máximo garantizado."
  },
  "receiver": {
    "layout": [
      {
        "text": "EventoController\nJSON a record",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "ConsumoIdempotente\nConsulta eventoId",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "ServicioDeNotificaciones\nConstruye el aviso",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Respuesta HTTP\nPermite marcar entrega",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "PostgreSQL\nGuarda eventoId",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "RepositorioEnMemoria\nGuarda texto del aviso",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Un duplicado conocido omite la creación. Aviso e identificador tienen distinta durabilidad: reiniciar pierde el texto."
  },
  "dockerBuild": {
    "layout": [
      {
        "text": "Contexto de build\npom.xml + src",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Etapa Maven + JDK 26\nCompila el proyecto",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "JAR generado\nPruebas omitidas aquí",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Contenedor Java\nProceso en puerto 8080",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Imagen final JRE 26\nUsuario sin root",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "COPY --from=build\nSolo el artefacto",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Dockerfile real: dos etapas. CI ejecuta verify antes del build. EXPOSE documenta el puerto, Compose lo publica."
  },
  "compose": {
    "layout": [
      {
        "text": "Cliente en el host\nlocalhost:8080",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "servicio-solicitudes\n8080 interno",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "db-solicitudes\n5432 interno",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "db-notificaciones\n5432 interno",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "servicio-notificaciones\nHost 8081 / interno 8080",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Red de Compose\nDNS por nombre",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        "HTTP"
      ],
      [
        1,
        2,
        "JDBC"
      ],
      [
        1,
        4,
        "evento HTTP",
        "bottom",
        "top",
        540,
        365
      ],
      [
        4,
        3,
        "JDBC",
        "left",
        "right"
      ]
    ],
    "caption": "Topología lógica: solicitudes publica eventos a notificaciones por HTTP. Cada servicio usa su propia base."
  },
  "kube": {
    "layout": [
      {
        "text": "Cliente\nAcceso local / NodePort",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Service solicitudes\nSelector app",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Pod solicitudes\nContenedor Java",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "PostgreSQL\nService + Pod + PVC",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Service notificaciones\nSelecciona Pod receptor",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Pod notificaciones\nContenedor Java",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        "HTTP"
      ],
      [
        1,
        2,
        "selector"
      ],
      [
        2,
        4,
        "HTTP",
        "bottom",
        "top",
        660,
        365
      ],
      [
        4,
        5,
        "selector"
      ],
      [
        5,
        3,
        "JDBC",
        "bottom",
        "bottom",
        530,
        550
      ]
    ],
    "caption": "Vista simplificada del tráfico. Deployments mantienen los Pods. Secret aporta credenciales y los PVC conservan datos."
  },
  "reconcile": {
    "layout": [
      {
        "text": "Manifiesto YAML\nImagen + réplicas",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "API de Kubernetes\nEstado deseado",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Deployment\nControla ReplicaSet",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Observación\nEventos y rollout",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Pod disponible\nReadiness permite tráfico",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "ReplicaSet\nCrea o repone Pods",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Reconciliación conceptual. Reponer un Pod no recupera los avisos en memoria ni garantiza que el negocio completó el flujo."
  },
  "pipeline": {
    "layout": [
      {
        "text": "push main / PR\nEvento de GitHub",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Runner Ubuntu\nMatriz: dos servicios",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Java 26 + PostgreSQL\nPreparación por job",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "GHCR\nImagen con SHA",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Docker build + push\nLogin con token",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "mvn -B verify\nPruebas + paquete",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Workflow actual: incluye prueba de arranque para solicitudes. Publica imágenes, pero no despliega al clúster."
  },
  "promotion": {
    "layout": [
      {
        "text": "Imagen publicada\nSHA y digest",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Desarrollo\nValidación funcional",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Pruebas integradas\nContrato + recuperación",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Verificación\nSalud y caso de negocio",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Producción\nAprobación y rollback",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Preproducción\nMisma imagen validada",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "PROPUESTA: promover la misma imagen y cambiar configuración por ambiente. El repositorio no automatiza esta ruta."
  },
  "git": {
    "layout": [
      {
        "text": "Directorio de trabajo\nArchivos modificados",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Staging / índice\ngit add por rutas",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Commit local\nSnapshot con mensaje",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "main integrada\nHistoria compartida",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Pull Request\nRevisión y checks",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Rama remota\ngit push",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "git diff revisa cambios locales y git diff --staged revisa lo que entrará al commit. Commit y push son pasos distintos."
  },
  "collaboration": {
    "layout": [
      {
        "text": "Issue\nProblema y aceptación",
        "box": [
          85,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Rama de trabajo\nCambio acotado",
        "box": [
          495,
          235,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Pull Request\nContexto y pruebas",
        "box": [
          905,
          235,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Release / paquete\nVersión identificable",
        "box": [
          85,
          425,
          290,
          110
        ],
        "core": false
      },
      {
        "text": "Merge a main\nCambio integrado",
        "box": [
          495,
          425,
          290,
          110
        ],
        "core": true
      },
      {
        "text": "Revisión + Actions\nEvidencia del cambio",
        "box": [
          905,
          425,
          290,
          110
        ],
        "core": false
      }
    ],
    "links": [
      [
        0,
        1,
        ""
      ],
      [
        1,
        2,
        ""
      ],
      [
        2,
        5,
        "",
        "bottom",
        "top",
        1100,
        365
      ],
      [
        5,
        4,
        "",
        "left",
        "right"
      ],
      [
        4,
        3,
        "",
        "left",
        "right"
      ]
    ],
    "caption": "Flujo de colaboración propuesto. Git guarda historia, GitHub coordina revisión, Actions valida y GHCR almacena imágenes."
  }
};
// Topología completa de aplicaciones y bases con recursos auxiliares.
diagrams.kube={
 layout:[
  {text:'Deployment: una réplica por aplicación',box:[70,195,540,55],size:21},
  {text:'Secret: credencial / PVC: 1Gi por base',box:[660,195,550,55],size:21},
  {text:'Service solicitudes\nAcceso NodePort',box:[70,285,290,105]},
  {text:'Pod solicitudes\nJava + configuración',box:[490,285,290,105],core:true},
  {text:'PostgreSQL solicitudes\nService + Pod + PVC',box:[910,285,300,105]},
  {text:'Service notificaciones\nDNS interno estable',box:[70,455,290,105]},
  {text:'Pod notificaciones\nReadiness HTTP',box:[490,455,290,105],core:true},
  {text:'DB notificaciones\nIDs consumidos + PVC',box:[910,455,300,105]}
 ],
 links:[[2,3,'selector','right','left',365,275],[3,4,'JDBC','right','left',790,275],[3,5,'evento HTTP','bottom','top',370,390],[5,6,'selector','right','left',365,445],[6,7,'JDBC','right','left',790,445]],
 caption:'Los Services seleccionan Pods por etiquetas. Cada aplicación usa su propia base. El texto del aviso sigue en memoria.'
};
// Fronteras y componentes de apoyo visibles, separados del flujo de ejecución.
for (const [key,d] of Object.entries(diagrams)) {
  const names={
    core:['ENTRADA Y REGLAS','CONTRATO Y TECNOLOGÍA'],
    query:['PETICIÓN Y CONTRATO','ADAPTACIÓN Y RETORNO'],
    transaction:['VALIDACIÓN Y CAMBIO DE ESTADO','PERSISTENCIA LOCAL Y CONFIRMACIÓN'],
    delivery:['TRABAJO PENDIENTE Y PUBLICACIÓN','RECEPCIÓN Y RESULTADO'],
    receiver:['CONTRATO Y REGLAS DE CONSUMO','DOS ALMACENAMIENTOS CON DISTINTA DURABILIDAD'],
    dockerBuild:['CONSTRUCCIÓN','ARTEFACTO Y EJECUCIÓN'],
    compose:['ACCESO Y SERVICIO EMISOR','RED INTERNA Y RECEPTOR'],
    
    reconcile:['DECLARACIÓN Y CONTROL','EJECUCIÓN Y OBSERVACIÓN'],
    pipeline:['DISPARADOR Y PREPARACIÓN','VALIDACIÓN Y PUBLICACIÓN'],
    promotion:['VALIDACIÓN DE LA VERSIÓN','PROMOCIÓN Y COMPROBACIÓN'],
    git:['HISTORIA LOCAL','COLABORACIÓN REMOTA'],
    collaboration:['DEFINICIÓN Y PROPUESTA','REVISIÓN Y ENTREGA']
  }[key];
  if(names) d.zones=[{label:names[0],box:[70,195,1140,160]},{label:names[1],box:[70,385,1140,160]}];
}
export const diagramSlides = {
  "equipo-desarrollo": {
    "10": "core",
    "13": "core",
    "15": "query",
    "16": "dependencies",
    "19": "transaction",
    "20": "delivery",
    "21": "receiver",
    "25": "dockerBuild",
    "27": "compose",
    "29": "reconcile",
    "30": "kube",
    "34": "pipeline",
    "36": "promotion",
    "43": "git",
    "45": "collaboration"
  },
  "staff-desarrollo": {
    "5": "core",
    "6": "core",
    "7": "dependencies",
    "11": "transaction",
    "12": "delivery",
    "15": "dockerBuild",
    "16": "compose",
    "18": "kube",
    "20": "pipeline",
    "21": "promotion",
    "26": "collaboration"
  }
};
