export function renderConvertView(container) {
  container.innerHTML = `
    <div class="card">
      <h2>Asset Converter</h2>
      <p>Convert mined BitMiner tokens and cryptographic rewards into supported currencies and assets instantly.</p>
      
      <div class="form-group">
        <label for="amount-input">Amount to Convert (BIT):</label>
        <input type="number" id="amount-input" value="100" min="1" step="1" />
      </div>

      <div class="form-group">
        <label for="currency-select">Target Currency / Asset:</label>
        <select id="currency-select">
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
        </select>
      </div>

      <button class="btn-primary" id="convert-btn">Convert Assets</button>

      <div id="conversion-result" style="display: none; margin-top: 1.5rem;">
        <label>Converted Value:</label>
        <div class="output-box" id="result-output">-</div>
      </div>
    </div>
  `;

  const convertBtn = container.querySelector('#convert-btn');
  const amountInput = container.querySelector('#amount-input');
  const currencySelect = container.querySelector('#currency-select');
  const conversionResult = container.querySelector('#conversion-result');
  const resultOutput = container.querySelector('#result-output');

  const rates = {
    USD: 1.45,
    EUR: 1.32,
    BTC: 0.000021,
    ETH: 0.00041
  };

  convertBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value) || 0;
    const currency = currencySelect.value;
    const rate = rates[currency] || 1;
    const converted = (amount * rate).toFixed(currency === 'BTC' || currency === 'ETH' ? 6 : 2);

    resultOutput.textContent = `${converted} ${currency}`;
    conversionResult.style.display = 'block';
  });
}
