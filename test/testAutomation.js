const { Builder, By, until } = require('selenium-webdriver');

async function loginAndAccessProfile() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // 1. Acessar homepage
        await driver.get('http://127.0.0.1:5500/SaveFood/Frontend/html/Homepage.html');
        console.log('✅ Homepage acessada com sucesso!');

        // 2. Clicar no link "Entrar" (btn-primary no hero)
        const entrarBtn = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(text(), 'Entrar')]")),
            5000
        );
        await entrarBtn.click();
        console.log('✅ Botão "Entrar" clicado com sucesso!');

        // 3. Esperar página de login carregar
        await driver.wait(until.elementLocated(By.id('studentEmail')), 5000);
        console.log('✅ Página de login carregada com sucesso!');

        // 4. Preencher formulário login
        const emailInput = await driver.findElement(By.id('studentEmail'));
        await emailInput.sendKeys('teste@gmail.com');

        const passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys('teste123');
        console.log('✅ Formulário de login preenchido com sucesso!');

        // 5. Clicar no botão Entrar
        const loginBtn = await driver.findElement(By.css('button.btn-login'));
        await loginBtn.click();
        console.log('✅ Login realizado com sucesso!');

        // Espera o avatar aparecer na navbar (max 5s)
        await driver.wait(until.elementLocated(By.css('a[title="Perfil do Usuário"]')), 5000);

        // Pega o link do avatar
        const avatarLink = await driver.findElement(By.css('a[title="Perfil do Usuário"]'));
        console.log('✅ Avatar encontrado na navbar!');

        // Clica no avatar para ir ao perfil
        await avatarLink.click();
        console.log('✅ Login e acesso ao perfil realizados com sucesso!');

        await driver.wait(until.urlContains('user.html'), 5000);
        console.log('✅ Página de perfil aberta com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await driver.quit();
    }
}

loginAndAccessProfile();
