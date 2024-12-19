async function startSequence() {
    const n = parseInt(document.getElementById('n').value);
    if (isNaN(n) || n < 1 || n > 1000) {
        alert("Veuillez entrer un nombre valide entre 1 et 1000.");
        return;
    }

    
    document.getElementById('form').style.display = 'none';

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = "<p>Début de la séquence...</p>";

    for (let i = 1; i <= n; i++) {
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const response = await fetchData();
            if (!response) {
                throw new Error("Erreur d'API ou CAPTCHA nécessaire");
            }

       
            if (response.captchaRequired) {
                outputDiv.innerHTML += "<p>Un captcha est requis. Veuillez le résoudre...</p>";
                await solveCaptcha(outputDiv, n, i);
                return; 
            }

            outputDiv.innerHTML += `<p>${i}. Forbidden</p>`;
        } catch (error) {
            outputDiv.innerHTML += `<p>Erreur au numéro ${i}: ${error.message}</p>`;
            break; 
        }
    }

    outputDiv.innerHTML += "<p>Fin de la séquence.</p>";
}

async function fetchData() {
    try {
        const response = await fetch('https://api.prod.jcloudify.com/whoami', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json',
            },
        });


        if (!response.ok) {
            if (response.status === 405) {
                console.error('Erreur 405 : Méthode non autorisée.');
            }
            return null;
        }

        const textResponse = await response.text();
        console.log(textResponse);  // Affiche la réponse brute pour le débogage

        // Essayer de parser en JSON si la réponse est correcte
        try {
            const data = JSON.parse(textResponse);
            return data;
        } catch (error) {
            console.error("Erreur de parsing JSON:", error);
            return null;
        }
    } catch (error) {
        console.error("Erreur dans l'appel API:", error);
        return null;
    }
}

async function solveCaptcha(outputDiv, n, i) {
  
    const captchaContainer = document.getElementById('captcha-container');
    captchaContainer.innerHTML = "<p>Veuillez résoudre le CAPTCHA ci-dessous :</p>";

    window.AWSWAFCaptcha.showCaptcha({
        containerId: 'captcha-container', 
        callback: function(result) {
            if (result && result.success) {
                captchaContainer.innerHTML += "<p>Captcha résolu, reprise de la séquence.</p>";
                continueSequence(n, i);
            } else {
                captchaContainer.innerHTML += "<p>Échec de la résolution du CAPTCHA. Veuillez réessayer.</p>";
            }
        }
    });
}

async function continueSequence(n, i) {
    const outputDiv = document.getElementById('output');
    for (let j = i; j <= n; j++) {
      
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const response = await fetchData();
            if (!response) {
                throw new Error("Erreur d'API ou CAPTCHA nécessaire");
            }

           
            if (response.captchaRequired) {
                outputDiv.innerHTML += "<p>Un captcha est requis. Veuillez le résoudre...</p>";
                await solveCaptcha(outputDiv, n, j);
                return; 
            }

            outputDiv.innerHTML += `<p>${j}. Forbidden</p>`;
        } catch (error) {
            outputDiv.innerHTML += `<p>Erreur au numéro ${j}: ${error.message}</p>`;
            break;
        }
    }
}
