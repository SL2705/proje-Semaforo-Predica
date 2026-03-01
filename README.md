# 🚦Vitalis 🚦 - Sistema de Prevención de Rotación Temprana

Este proyecto es una solución tecnológica diseñada para identificar y mitigar la rotación prematura de personal en el sector maquilador. A través de un análisis de indicadores clave, el sistema permite a Recursos Humanos actuar de forma preventiva antes de que el empleado decida renunciar.

<!--
---

## Tabla de Contenidos
* [Descripción del Proyecto](#-descripción-del-proyecto)
* [Tecnologías y Base de Datos](#-tecnologías-y-base-de-datos)
* [Requisitos del Sistema](#-requisitos-del-sistema)
* [Instalación y Ejecución](#-instalación-y-ejecución)
* [Seguridad y Confidencialidad](#-seguridad-y-confidencialidad)
-->

---

## Descripción del Proyecto
El sistema recopila información (asistencia, productividad, antigüedad) y visualiza el estado del empleado mediante colores. Permite generar reportes para RRHH, facilitando acciones preventivas como capacitación o acompañamiento antes de una renuncia inminente.



## Tecnologías y Base de Datos
El proyecto utiliza un stack híbrido para garantizar escalabilidad y análisis de datos:
* **Frontend:** Ionic Framework con JavaScript.
* **Backend:** Node.js para la lógica de servidor.
* **Móvil:** Cordova para el despliegue híbrido.
* **Análisis:** Python para el procesamiento de métricas de riesgo.
* **Infraestructura de Datos:**
    * **Firebase:** Utilizado para la autenticación de usuarios en tiempo real y gestión de sesiones.
    * **PostgreSQL:** Base de datos relacional para el almacenamiento estructurado de historial de asistencia, evaluaciones, productividad y perfiles de empleados.

---

## Requisitos del Sistema

### Software y Versiones
Para ejecutar este proyecto, asegúrate de tener instalado:

| Herramienta | Versión Mínima |
| :--- | :--- |
| **Sistema Operativo** | Windows 10/11, macOS 12.0+ o Linux (Ubuntu 20.04+) |
| **Node.js** | v18.16.0 (LTS) |
| **npm** | v9.5.0 |
| **Python** | v3.10.x |
| **PostgreSQL** | v14.0 |
| **Ionic CLI** | v7.1.1 |
| **Cordova** | v11.0.0 |

---

## ⚙️ Instalación y Ejecución ⚙️

Sigue estos pasos para configurar el entorno de desarrollo:

## 1. Clonar y preparar el Frontend
```bash
git clone [https://github.com/tu-usuario/nombre-del-proyecto.git](https://github.com/tu-usuario/nombre-del-proyecto.git)
cd nombre-del-proyecto
npm install
```

## 2. Clonar y preparar el Frontend
Ejecuta los siguientes comandos para instalar los paquetes necesarios:

### Frontend (Ionic):
```bash
npm install
```

### Backend (Node.js & Python):
```bash
cd backend
npm install
pip install -r requirements.txt
```

## 3. Configuración de Base de Datos
* **PostgreSQL:** Crea una base de datos local y ejecuta los scripts de creación de tablas. Asegúrate de configurar las relaciones para asistencia y productividad.
* **Firebase:** Configura un nuevo proyecto en la consola de Firebase. Descarga las credenciales (SDK) y agrégalas a tu configuración de backend para habilitar el login.
* **Variables de Entorno:** Configura un archivo ```.env``` en la carpeta ```/backend```  con los siguientes datos:

```bash
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_password
DB_NAME=maquila_db
FIREBASE_CONFIG={...}
```

## 4. Ejecución del Proyecto
Para poner en marcha el sistema:
* **Servidor:** Dentro de la carpeta ```backend/```, ejecuta ```npm start``` o ```node index.js```.
* **Aplicación:** En la raíz del proyecto, ejecuta:
```bash
ionic serve
```
---

## Seguridad y Confidencialidad
El sistema implementa medidas estrictas para garantizar la protección de datos:
* **Control de Acceso (RBAC):** Login con roles definidos:
    * **RRHH:** Acceso total a reportes y semáforos globales.
    * **Supervisor:** Visualización limitada a su equipo directo.
    * **Empleado:** Solo puede ver su propio estado y semáforo.
* **Cifrado de Información:** Las contraseñas se gestionan mediante Firebase Auth y los datos sensibles en PostgreSQL se protegen mediante consultas parametrizadas para evitar inyecciones.
* **Auditoría y Monitoreo:** El sistema registra un historial (logs) de accesos, detallando quién consultó la información y en qué momento.
* **Políticas Internas:** Los datos son para uso exclusivo de análisis de retención, prohibiendo cualquier uso externo no autorizado.
  
---

### Proyecto Desarrollado por UTCJ - Grupo: IDSM11 - Materia: Seguridad Informatica
