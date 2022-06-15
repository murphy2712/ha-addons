const Voltalis = require("./lib/voltalis");
const HomeAssistant = require("./lib/homeassistant");
const CONFIG = require('./config');
const registerSensors = require('./sensors');
const registerPollers = require('./pollers');

const voltalis = new Voltalis(CONFIG.username, CONFIG.password);
const hass = new HomeAssistant(process.env.SUPERVISOR_TOKEN);

(async () => {
	await voltalis.login()
	console.log('Connected to Voltalis API.');

	const sensors = registerSensors(hass);
	const pollers = registerPollers(voltalis);

	pollers.immediateConsumptionInkW.subscribe({
		next: async ({ data }) => {
				console.log('[immediateConsumptionInkW]', data);

			await sensors.voltalis_immediate_consumption.update({
				state: data.immediateConsumptionInkW.consumption * 1000,
			})

			await sensors.voltalis_consumption.update({
				state: data.immediateConsumptionInkW.consumption * (data.immediateConsumptionInkW.duration / 3600) * 1000,
			})
		},
		error: (e) => {console.error(e.message, e.stack)}
	})

})();
