pipeline {
    agent any

    environment {
        // Se asume que en Jenkins -> Global Tool Configuration hay una instalación de NodeJS llamada "NodeJS"
        PATH = "${env.WORKSPACE}/node_modules/.bin:${env.PATH}"
    }

    tools {
        nodejs 'NodeJS' // Asegúrate de que este nombre coincida con tu configuración global de Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build Angular App') {
            steps {
                echo 'Building for production...'
                sh 'npm run build'
            }
        }

        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying to Nginx public folder...'
                // El proyecto por defecto se compila en dist/exam-creator/browser
                // Mueve los archivos al directorio donde Nginx los va a servir.
                // (Asegúrate de que el usuario jenkins tenga permisos sobre /var/www/exam-creator)
                sh 'sudo mkdir -p /var/www/exam-creator'
                sh 'sudo rsync -av --delete dist/exam-creator/browser/ /var/www/exam-creator/'
                sh 'sudo chown -R www-data:www-data /var/www/exam-creator/'
            }
        }
    }
}
