pipeline {
    agent {
        docker {
            image 'node:22-alpine'
            // Esto asegura que el contenedor tenga acceso a la red host si lo necesitas o solo corra los comandos dentro
            args '-u root'
        }
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
                sh 'npx @angular/cli build'
            }
        }

        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying to Nginx public folder...'
                // Aca salimos del contexto puro de node si es necesario, pero como mapea el workspace, podemos copiarlo
                sh 'mkdir -p /var/www/exam-creator'
                sh 'cp -r dist/exam-creator/browser/* /var/www/exam-creator/'
                sh 'chown -R root:root /var/www/exam-creator/'
            }
        }
    }
}
