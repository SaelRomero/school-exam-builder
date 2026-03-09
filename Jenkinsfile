pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Angular App') {
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root'
                }
            }
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
                echo 'Building for production...'
                sh 'npx @angular/cli build'
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
