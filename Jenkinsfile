pipeline {
    agent any

    environment {
        IMAGE_NAME = "shashankkanade25/krishisetu"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/shashankkanade25/Krishi-Setu.git'
            }
        }

        stage('Build Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:latest ./Krishisetu-web
                '''
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-cred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker pull shashankkanade25/krishisetu:latest
        
                docker stop krishi-app || true
                docker rm krishi-app || true
        
                docker run -d \
                  --name krishi-app \
                  -p 5000:5000 \
                  shashankkanade25/krishisetu:latest
                '''
            }
        }
    }
}
