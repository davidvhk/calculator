package org.vhkzone.calculator;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class CalculatorEngine {
    private String currentValue = "0";
    private String previousValue = null;
    private String operator = null;
    private boolean waitingForNewOperand = false;
    private String equationHistory = "";
    private List<String> historyList = new ArrayList<>();

    public CalculatorEngine() {
        clearAll();
    }

    public void clearAll() {
        currentValue = "0";
        previousValue = null;
        operator = null;
        waitingForNewOperand = false;
        equationHistory = "";
    }

    public void clearHistory() {
        historyList.clear();
    }

    public List<String> getHistoryList() {
        return new ArrayList<>(historyList);
    }

    public void loadHistory(List<String> list) {
        historyList.clear();
        if (list != null) {
            historyList.addAll(list);
        }
    }

    public void inputDigit(String digit) {
        if (waitingForNewOperand) {
            currentValue = digit;
            waitingForNewOperand = false;
        } else {
            if (currentValue.equals("0") || currentValue.equals("Error")) {
                currentValue = digit;
            } else {
                if (currentValue.replace("-", "").replace(".", "").length() < 15) {
                    currentValue += digit;
                }
            }
        }
    }

    public void inputDecimal() {
        if (waitingForNewOperand) {
            currentValue = "0.";
            waitingForNewOperand = false;
            return;
        }
        if (currentValue.equals("Error")) {
            currentValue = "0.";
            return;
        }
        if (!currentValue.contains(".")) {
            currentValue += ".";
        }
    }

    public void toggleSign() {
        if (currentValue.equals("0") || currentValue.equals("Error")) return;
        if (currentValue.startsWith("-")) {
            currentValue = currentValue.substring(1);
        } else {
            currentValue = "-" + currentValue;
        }
    }

    public void backspace() {
        if (waitingForNewOperand || currentValue.equals("Error")) {
            currentValue = "0";
            return;
        }
        if (currentValue.length() > 1) {
            currentValue = currentValue.substring(0, currentValue.length() - 1);
            if (currentValue.equals("-")) currentValue = "0";
        } else {
            currentValue = "0";
        }
    }

    public void percentage() {
        if (currentValue.equals("Error")) return;
        try {
            double val = Double.parseDouble(currentValue);
            if (previousValue != null && operator != null && (operator.equals("+") || operator.equals("-"))) {
                double prev = Double.parseDouble(previousValue);
                val = prev * (val / 100.0);
            } else {
                val = val / 100.0;
            }
            currentValue = formatNumber(val);
            waitingForNewOperand = true;
        } catch (Exception e) {
            currentValue = "Error";
        }
    }

    public void setOperator(String nextOperator) {
        if (currentValue.equals("Error")) return;

        if (operator != null && !waitingForNewOperand) {
            calculateEquals(false);
        }

        previousValue = currentValue;
        operator = nextOperator;
        waitingForNewOperand = true;
        equationHistory = previousValue + " " + operator;
    }

    public void calculateEquals() {
        calculateEquals(true);
    }

    private void calculateEquals(boolean updateHistoryDisplay) {
        if (operator == null || previousValue == null || currentValue.equals("Error")) {
            return;
        }

        try {
            BigDecimal a = new BigDecimal(previousValue);
            BigDecimal b = new BigDecimal(currentValue);
            BigDecimal result;

            switch (operator) {
                case "+":
                    result = a.add(b);
                    break;
                case "-":
                    result = a.subtract(b);
                    break;
                case "×":
                case "*":
                    result = a.multiply(b);
                    break;
                case "÷":
                case "/":
                    if (b.compareTo(BigDecimal.ZERO) == 0) {
                        currentValue = "Error";
                        operator = null;
                        previousValue = null;
                        equationHistory = "";
                        return;
                    }
                    result = a.divide(b, new MathContext(15, RoundingMode.HALF_UP));
                    break;
                default:
                    return;
            }

            String formattedResult = formatNumber(result.doubleValue());
            if (updateHistoryDisplay) {
                equationHistory = previousValue + " " + operator + " " + currentValue + " =";
                String item = equationHistory + " " + formattedResult;
                historyList.add(0, item);
                if (historyList.size() > 20) {
                    historyList.remove(historyList.size() - 1);
                }
            }
            currentValue = formattedResult;
            previousValue = null;
            operator = null;
            waitingForNewOperand = true;
        } catch (Exception e) {
            currentValue = "Error";
            operator = null;
            previousValue = null;
        }
    }

    public String getCurrentValue() {
        return currentValue;
    }

    public String getOperator() {
        return operator != null ? operator : "";
    }

    public String getEquationHistory() {
        return equationHistory;
    }

    private String formatNumber(double num) {
        if (Double.isNaN(num) || Double.isInfinite(num)) return "Error";
        if (Math.abs(num) >= 1e15 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
            DecimalFormat expFormat = new DecimalFormat("0.######E0", new DecimalFormatSymbols(Locale.US));
            return expFormat.format(num).replace("E", "e");
        }
        DecimalFormat df = new DecimalFormat("#.##########", new DecimalFormatSymbols(Locale.US));
        df.setMaximumFractionDigits(10);
        return df.format(num);
    }
}
