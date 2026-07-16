pipeline {
    agent any

    environment {
        DOCKER_USERNAME = "shashankkanade25"
        IMAGE_NAME = "${DOCKER_USERNAME}/krishisetu"
        IMAGE_TAG  = "${BUILD_NUMBER}"
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
                        which node
                        node -v
                        npm -v
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

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:$IMAGE_TAG ./Krishisetu-web
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                trivy image \
                 --scanners vuln \
                 --format table \
                 -o trivy-report.txt \
                 --severity HIGH,CRITICAL \
                $IMAGE_NAME:$IMAGE_TAG
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

        stage('Clone GitOps Repo') {
            steps {
                dir('gitops') {
                    git branch: 'main',
                        credentialsId: 'github-token',
                        url: 'https://github.com/shashankkanade25/krishisetu-gitops.git'
                }
            }
        }

        stage('Verify GitOps Repo') {
            steps {
                sh '''
                pwd

                ls -la

                ls -la gitops

                ls -la gitops/charts
                '''
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
                    $IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }
    }
}
