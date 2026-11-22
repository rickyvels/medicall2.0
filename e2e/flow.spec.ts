import { expect, test } from '@playwright/test'

const shot = process.env.SHOTS_DIR

const onboard = async (page: import('@playwright/test').Page) => {
  await page.goto('/app/bienvenida')
  await page.getByLabel('Nombre', { exact: true }).fill('Ana')
  await page.getByLabel('Apellido').fill('Paz')
  await page.getByLabel('Celular').fill('912345678')
  await page.getByLabel('Fecha de nacimiento').fill('1990-01-01')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Comenzar' }).click()
  await expect(page.getByRole('heading', { name: /Ana/ })).toBeVisible()
}

test('flujo completo: onboarding → triaje → matching → consulta → resumen', async ({ page }, info) => {
  const snap = async (name: string) => { if (shot) await page.screenshot({ path: `${shot}/${info.project.name}-${name}.png` }) }

  await page.goto('/app')
  await expect(page).toHaveURL(/\/app\/bienvenida/)
  await snap('01-onboarding')

  // validación
  await page.getByRole('button', { name: 'Comenzar' }).click()
  await expect(page.getByText('Ingresa tu nombre')).toBeVisible()

  await page.getByLabel('Nombre', { exact: true }).fill('Lucía')
  await page.getByLabel('Apellido').fill('Ramos')
  await page.getByLabel('Celular').fill('987 654 321')
  await page.getByLabel('Fecha de nacimiento').fill('1994-05-12')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Comenzar' }).click()

  await expect(page.getByRole('heading', { name: /Lucía/ })).toBeVisible()
  await snap('02-home')

  await page.getByRole('link', { name: 'Dolor de cabeza' }).click()
  await page.getByRole('radio').first().click()
  await snap('03-triage')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: 'Ver recomendación' }).click()

  await expect(page.getByRole('heading', { name: /teleconsulta/i })).toBeVisible()
  await page.getByLabel('¿Tienes un cupón?').fill('BIENVENIDA20')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText('S/ 28.00').first()).toBeVisible()
  await snap('04-result')
  await page.getByRole('button', { name: 'Buscar médico ahora' }).click()

  await expect(page.getByRole('heading', { name: 'Buscando tu médico…' })).toBeVisible()
  await snap('05-searching')
  await expect(page.getByRole('button', { name: 'Iniciar consulta' })).toBeVisible({ timeout: 15_000 })
  await snap('06-matched')
  await page.getByRole('button', { name: 'Iniciar consulta' }).click()

  await expect(page.getByRole('timer')).toBeVisible()
  await snap('07-room')
  await page.getByRole('button', { name: 'Terminar consulta' }).click()

  await expect(page.getByRole('heading', { name: 'Resumen de tu consulta' })).toBeVisible()
  await page.getByRole('radio', { name: '5 estrellas' }).click()
  await snap('08-summary')

  await page.goto('/app/bienestar'); await expect(page.getByRole('heading', { name: 'Tu bienestar' })).toBeVisible(); await snap('09-wellness')
  await page.goto('/app/wallet'); await expect(page.getByRole('heading', { name: 'Wallet' })).toBeVisible(); await snap('10-wallet')
  await page.goto('/app/clinicas'); await expect(page.getByRole('heading', { name: 'Clínicas aliadas' })).toBeVisible(); await snap('11-clinics')
  await page.goto('/app/consultas'); await page.getByRole('tab', { name: 'Historial' }).click(); await expect(page.getByText('Completada')).toBeVisible()
})

test('emergencia: señal de alarma deriva a 106', async ({ page }) => {
  await onboard(page)
  await page.goto('/app/triaje/fever')
  await page.getByRole('radio').first().click(); await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('radio').first().click(); await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('radio', { name: /Dificultad para respirar/ }).click()
  await page.getByRole('button', { name: 'Ver recomendación' }).click()
  await expect(page.getByRole('link', { name: /106/ })).toBeVisible()
})



test('agendar teleconsulta: elegir médico/día/hora, confirmar, exportar y cancelar', async ({ page }, info) => {
  const snap = async (name: string) => { if (shot) await page.screenshot({ path: `${shot}/${info.project.name}-${name}.png` }) }
  await onboard(page)
  await snap('20-home-hero')

  await page.getByRole('link', { name: /Agendar/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Agenda tu teleconsulta' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar cita' })).toBeDisabled()

  await page.getByRole('radiogroup', { name: 'Día' }).getByRole('radio').nth(1).click() // mañana: siempre hay horarios
  // marketplace: muchos profesionales, filtrables y paginados
  await expect(page.getByText(/\d+ profesionales disponibles/)).toBeVisible()
  const count = async () => Number((await page.getByText(/\d+ profesionales disponibles/).textContent())!.match(/\d+/)![0])
  expect(await count()).toBeGreaterThan(20)
  await page.getByRole('button', { name: 'Ver más profesionales' }).click()
  await page.getByRole('group', { name: 'Especialidad' }).getByRole('button', { name: 'Pediatría' }).click()
  await expect.poll(count).toBeLessThan(15)
  await page.getByLabel('Buscar profesionales').fill('Valeria')
  await expect(page.getByRole('radiogroup', { name: /Horarios de Dra\. Valeria Quispe/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Todas' }).click()
  await expect(page.getByRole('radiogroup', { name: /Horarios de Dra\. Valeria Quispe/ })).toBeVisible()
  const slot = page.getByRole('radiogroup', { name: /Horarios de Dra\. Valeria Quispe/ }).getByRole('radio').first()
  await slot.click()
  await page.getByRole('button', { name: 'Dolor de cabeza' }).click()
  await snap('21-schedule')
  await page.getByRole('button', { name: 'Confirmar cita' }).click()

  await expect(page.getByRole('heading', { name: '¡Cita confirmada!' })).toBeVisible()
  await snap('22-schedule-done')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Agregar a mi calendario' }).click()])
  expect(download.suggestedFilename()).toMatch(/\.ics$/)

  await page.getByRole('button', { name: 'Ver mis citas' }).click()
  await expect(page.getByRole('tab', { name: /Próximas \(1\)/ })).toBeVisible()
  await expect(page.getByText('Dra. Valeria Quispe')).toBeVisible()
  await expect(page.getByRole('button', { name: /Disponible 10 min antes/ })).toBeDisabled()
  await snap('23-upcoming')

  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByText('No tienes citas próximas')).toBeVisible()
})


test('directorio: buscar, ver perfil público, favoritos y agendar desde el perfil', async ({ page }, info) => {
  const snap = async (name: string) => { if (shot) await page.screenshot({ path: `${shot}/${info.project.name}-${name}.png` }) }
  await onboard(page)
  await page.goto('/app/medicos')
  await expect(page.getByRole('heading', { name: 'Médicos', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /Ver perfil de Dra\. Valeria Quispe/ })).toBeVisible()
  await snap('30-directory')

  // búsqueda sin importar tildes + sin resultados
  await page.getByLabel('Buscar médicos').fill('pediatria')
  await expect(page.getByRole('link', { name: /Ver perfil de Dra\. Renata Campos/ })).toBeVisible()
  await page.getByLabel('Buscar médicos').fill('zzzz')
  await expect(page.getByText('No encontramos médicos')).toBeVisible()
  await page.getByRole('button', { name: 'Limpiar filtros' }).click()

  // perfil de un médico fuera de línea
  await page.getByLabel('Buscar médicos').fill('renata')
  await page.getByRole('link', { name: /Ver perfil de Dra\. Renata Campos/ }).click()
  await expect(page.getByRole('heading', { name: /Renata Campos/ })).toBeVisible()
  await expect(page.getByText('Servicios y tarifas')).toBeVisible()
  await expect(page.getByText('Reseñas de pacientes')).toBeVisible()
  await expect(page.getByText('Fuera de línea').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /No disponible ahora/ })).toHaveAttribute('aria-disabled', 'true')
  await snap('31-profile')

  // favoritos
  await page.getByRole('button', { name: 'Guardar en favoritos' }).click()
  await expect(page.getByRole('button', { name: 'Quitar de favoritos' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/app/medicos')
  await page.getByRole('button', { name: 'Favoritos' }).click()
  await expect(page.getByRole('link', { name: /Ver perfil de/ })).toHaveCount(1)

  // agendar desde el perfil: el médico llega preseleccionado
  await page.getByRole('link', { name: /Ver perfil de Dra\. Renata Campos/ }).click()
  await page.getByRole('link', { name: 'Agendar' }).click()
  // el médico del perfil llega fijado al inicio de la lista
  await expect(page.getByRole('list').getByRole('listitem').first()).toContainText('Renata Campos')
})

test('profesional independiente: se registra, se verifica y aparece en el directorio', async ({ page }, info) => {
  const snap = async (name: string) => { if (shot) await page.screenshot({ path: `${shot}/${info.project.name}-${name}.png` }) }
  await onboard(page)
  await page.goto('/app/perfil')
  await page.getByRole('link', { name: /¿Eres profesional de la salud\?/ }).click()
  await expect(page.getByRole('heading', { name: 'Ofrece tus servicios en MediCall' })).toBeVisible()
  await snap('32-pro-register')

  // validaciones
  await page.getByRole('button', { name: 'Enviar para verificación' }).click()
  await expect(page.getByText('Elige tu especialidad')).toBeVisible()
  await expect(page.getByText(/número de colegiatura/)).toBeVisible()
  await expect(page.getByText('Debes aceptar para continuar')).toBeVisible()

  await page.getByLabel('Título').selectOption('Dra.')
  await page.getByLabel('Especialidad').selectOption('Nutrición')
  await page.getByLabel('N.º de colegiatura').fill('90123')
  await page.getByLabel('Años de experiencia').fill('6')
  await page.getByLabel('Sobre ti').fill('Nutricionista clínica enfocada en hábitos sostenibles y planes personalizados para cada paciente.')
  await page.getByLabel(/Tarifa por teleconsulta/).fill('60')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviar para verificación' }).click()

  await expect(page.getByRole('heading', { name: 'Estamos verificando tu colegiatura' })).toBeVisible()
  await expect(page.getByRole('switch', { name: 'Disponible ahora' })).toBeDisabled()
  await snap('33-pro-pending')

  // la verificación (simulada) tarda unos segundos
  await expect(page.getByRole('heading', { name: 'Ya eres visible para los pacientes' })).toBeVisible({ timeout: 20_000 })
  await page.getByRole('switch', { name: 'Disponible ahora' }).click()
  await expect(page.getByRole('switch', { name: 'Disponible ahora' })).toBeChecked()
  await snap('34-pro-verified')

  await page.goto('/app/medicos')
  await page.getByLabel('Buscar médicos').fill('Ana Paz')
  const card = page.getByRole('link', { name: /Ver perfil de Dra\. Ana Paz/ })
  await expect(card).toBeVisible()
  await card.click()
  await expect(page.getByRole('heading', { name: /Ana Paz/ })).toBeVisible()
  await expect(page.getByText('Nutrición').first()).toBeVisible()
  await expect(page.getByText(/aún no tiene reseñas/)).toBeVisible()
})

test('landing en "/" y su CTA lleva a la app en /app', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByText('¿Te sientes mal? Consulta a un médico al instante y obtén tu receta')).toBeVisible()
  await expect(page.getByText('Tarifas Transparentes')).toBeVisible()
  if (shot) await page.screenshot({ path: `${shot}/${info.project.name}-40-landing.png` })
  await page.getByTestId('start-button').click()
  await expect(page).toHaveURL(/\/app\/bienvenida/)
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible()
})
