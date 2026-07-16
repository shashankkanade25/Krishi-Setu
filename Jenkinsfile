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
                    docker push $IMAGE_NAME:$IMAGE_TAG
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

        stage('Update Image Tag') {
            steps {
                dir('gitops/charts/krishisetu') {

                    sh '''
                    echo "Before:"
                    cat values.yaml

                    sed -i "s/tag:.*/tag: \\"${IMAGE_TAG}\\"/" values.yaml

                    echo "After:"
                    cat values.yaml
                    '''
                }
            }
        }

        stage('Commit Changes') {
            steps {
                dir('gitops') {

                    sh '''
                    git config user.name "Jenkins"

                    git config user.email "jenkins@krishisetu.local"

                    git add .

                    git commit -m "Update image tag to ${IMAGE_TAG}" || true
                    '''
                }
            }
        }

        stage('Push GitOps Repo') {
            steps {
                dir('gitops') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'github-token',
                            usernameVariable: 'GIT_USER',
                            passwordVariable: 'GIT_TOKEN'
                        )
                    ]) {
                        sh '''
                        git remote set-url origin https://${GIT_USER}:${GIT_TOKEN}@github.com/shashankkanade25/krishisetu-gitops.git

                        git push origin main
                        '''
                    }
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
    }
}
