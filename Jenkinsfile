pipeline {
    agent any

    environment {
        IMAGE_NAME = "shashankkanade25/krishisetu"
        SONAR_HOME = tool "SonarScanner"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/shashankkanade25/Krishi-Setu.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('Krishisetu-web') {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                        $SONAR_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=krishisetu \
                        -Dsonar.projectName=KrishiSetu \
                        -Dsonar.sources=. \
                        -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:latest ./Krishisetu-web
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                trivy image \
                --severity HIGH,CRITICAL \
                --exit-code 1 \
                $IMAGE_NAME:latest
                '''
            }
        }

        stage('Push Docker Image') {
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
                docker pull $IMAGE_NAME:latest

                docker stop krishi-app || true
                docker rm krishi-app || true

                docker run -d \
                    --name krishi-app \
                    -p 5000:5000 \
                    $IMAGE_NAME:latest
                '''
            }
        }
    }
}
