pipeline {
    agent any
    
    // Especificar que use la rama main
    options {
        gitLabConnection('origin')
        skipDefaultCheckout(true)
    }
    
    stages {
        // Paso 1: Obtener el código de la rama main
        stage('Descargar Código') {
            steps {
                echo 'Descargando código desde Git (rama main)...'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }
        
        // Paso 2: Instalar dependencias
        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando dependencias con npm...'
                bat 'npm install'
            }
        }
        
        // Paso 3: Ejecutar tests básicos
        stage('Ejecutar Tests') {
            steps {
                echo 'Ejecutando pruebas...'
                bat 'npm test -- --watchAll=false'
            }
        }
    }
    
    post {
        success {
            echo '✅ ¡Todo salió bien!'
        }
        failure {
            echo '❌ Algo falló, revisa los logs'
        }
    }
}