import { exec } from 'child_process';

const Vuln = async (req, res) => {
    try{
        const { imageName, tag = 'latest' } = req.body;

        if (!imageName) {
            return res.status(400).send({ error: 'Please provide an image name.' });
        }
        // Construct the Trivy command with JSON output format
        const trivyCommand = `trivy image ${imageName}:${tag} --format json`;
            // Execute the Trivy command using exec
        exec(trivyCommand, (error, stdout, stderr) => {
            try {
            // Parse the JSON output
            const scanResults = JSON.parse(stdout);

            // Return the scan results to the client
            return res.json({
                message: 'Scan completed successfully!',
                results: scanResults,
            });
            } catch (parseError) {
            console.error(`Error parsing Trivy JSON output: ${parseError.message}`);
            return res.status(500).send({ error: `Failed to parse scan results: ${parseError.message}` });
            }
        });
    } catch (error) {
        console.error('Error in /vuln:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export { Vuln };