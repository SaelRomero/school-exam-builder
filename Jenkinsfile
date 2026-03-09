pipeline {
    agent any

    environment {
        // Agregamos la ruta del node que usamos nosotros en la maquina para que Jenkins lo vea
        PATH = "/home/argus/.nvm/versions/node/v22.22.1/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Build') {
            steps {
                echo 'Checking Node version...'
                sh 'node -v'
                echo 'Installing dependencies...'
                sh 'npm install'
                echo 'Building for production...'
                sh 'npx @angular/cli build --base-href /exam-creator/'
            }
        }

        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying to Nginx public folder...'
                sh 'sudo mkdir -p /var/www/exam-creator'
                sh 'sudo rsync -av --delete dist/exam-creator/browser/ /var/www/exam-creator/'
                sh 'sudo chown -R www-data:www-data /var/www/exam-creator/'
            }
        }
    }
}
