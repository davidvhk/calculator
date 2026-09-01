package org.vhkzone.calculator;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.HapticFeedbackConstants;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity implements View.OnClickListener, View.OnLongClickListener {

    private LinearLayout layoutRoot;
    private LinearLayout layoutDisplay;
    private TextView tvOperator;
    private TextView tvDisplay;
    private CalculatorEngine calc;
    private Vibrator vibrator;
    private SharedPreferences prefs;

    private static final String PREF_THEME = "watch_theme";
    private static final String PREF_HISTORY = "watch_history";

    private final String[] THEME_NAMES = {
        "OLED Midnight",
        "Vintage 80s LCD",
        "Cyberpunk Neon",
        "Modern Light"
    };
    private int currentThemeIndex = 0;

    // Cache of buttons for dynamic theming
    private final List<Button> numButtons = new ArrayList<>();
    private final List<Button> funcButtons = new ArrayList<>();
    private final List<Button> opButtons = new ArrayList<>();
    private Button btnEquals;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences("org.vhkzone.calculator", MODE_PRIVATE);
        calc = new CalculatorEngine();
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        layoutRoot = findViewById(R.id.layoutRoot);
        layoutDisplay = findViewById(R.id.layoutDisplay);
        tvOperator = findViewById(R.id.tvOperator);
        tvDisplay = findViewById(R.id.tvDisplay);

        // Load saved history
        String savedHistoryStr = prefs.getString(PREF_HISTORY, "");
        if (!savedHistoryStr.isEmpty()) {
            calc.loadHistory(Arrays.asList(savedHistoryStr.split(";;;")));
        }

        // Tap or Long-press display (or any text in the middle) to cycle themes
        View.OnClickListener themeClickListener = v -> cycleTheme();
        View.OnLongClickListener themeLongClickListener = v -> {
            cycleTheme();
            return true;
        };

        if (layoutDisplay != null) {
            layoutDisplay.setOnClickListener(themeClickListener);
            layoutDisplay.setOnLongClickListener(themeLongClickListener);
        }
        if (tvDisplay != null) {
            tvDisplay.setOnClickListener(themeClickListener);
            tvDisplay.setOnLongClickListener(themeLongClickListener);
        }
        if (tvOperator != null) {
            tvOperator.setOnClickListener(themeClickListener);
            tvOperator.setOnLongClickListener(themeLongClickListener);
        }

        // Bind buttons
        bindButtons();

        // Load and apply saved theme
        currentThemeIndex = prefs.getInt(PREF_THEME, 0);
        applyTheme(currentThemeIndex, false);

        updateUI();
    }

    private void bindButtons() {
        int[] numIds = { R.id.btn0, R.id.btn1, R.id.btn2, R.id.btn3, R.id.btn4, R.id.btn5, R.id.btn6, R.id.btn7, R.id.btn8, R.id.btn9, R.id.btnDot, R.id.btnSign };
        int[] funcIds = { R.id.btnC, R.id.btnBackspace, R.id.btnPercent };
        int[] opIds = { R.id.btnAdd, R.id.btnSub, R.id.btnMul, R.id.btnDiv };

        for (int id : numIds) {
            Button btn = findViewById(id);
            if (btn != null) {
                btn.setOnClickListener(this);
                numButtons.add(btn);
            }
        }

        for (int id : funcIds) {
            Button btn = findViewById(id);
            if (btn != null) {
                btn.setOnClickListener(this);
                funcButtons.add(btn);
            }
        }

        for (int id : opIds) {
            Button btn = findViewById(id);
            if (btn != null) {
                btn.setOnClickListener(this);
                opButtons.add(btn);
            }
        }

        btnEquals = findViewById(R.id.btnEquals);
        if (btnEquals != null) {
            btnEquals.setOnClickListener(this);
            btnEquals.setOnLongClickListener(v -> {
                triggerHaptic(v);
                showHistoryDialog(); // Long-press = opens history!
                return true;
            });
        }

        Button btnC = findViewById(R.id.btnC);
        if (btnC != null) {
            btnC.setOnClickListener(this);
            btnC.setOnLongClickListener(v -> {
                triggerHaptic(v);
                cycleTheme(); // Long-press C cycles themes!
                return true;
            });
        }

        Button btnSign = findViewById(R.id.btnSign);
        if (btnSign != null) {
            btnSign.setOnClickListener(this);
            btnSign.setOnLongClickListener(v -> {
                triggerHaptic(v);
                cycleTheme(); // Long-press ± also cycles themes!
                return true;
            });
        }
    }

    @Override
    public void onClick(View v) {
        triggerHaptic(v);

        int id = v.getId();
        if (id == R.id.btn0) calc.inputDigit("0");
        else if (id == R.id.btn1) calc.inputDigit("1");
        else if (id == R.id.btn2) calc.inputDigit("2");
        else if (id == R.id.btn3) calc.inputDigit("3");
        else if (id == R.id.btn4) calc.inputDigit("4");
        else if (id == R.id.btn5) calc.inputDigit("5");
        else if (id == R.id.btn6) calc.inputDigit("6");
        else if (id == R.id.btn7) calc.inputDigit("7");
        else if (id == R.id.btn8) calc.inputDigit("8");
        else if (id == R.id.btn9) calc.inputDigit("9");
        else if (id == R.id.btnDot) calc.inputDecimal();
        else if (id == R.id.btnSign) calc.toggleSign();
        else if (id == R.id.btnC) calc.clearAll();
        else if (id == R.id.btnBackspace) calc.backspace();
        else if (id == R.id.btnPercent) calc.percentage();
        else if (id == R.id.btnAdd) calc.setOperator("+");
        else if (id == R.id.btnSub) calc.setOperator("-");
        else if (id == R.id.btnMul) calc.setOperator("×");
        else if (id == R.id.btnDiv) calc.setOperator("÷");
        else if (id == R.id.btnEquals) {
            calc.calculateEquals();
            saveHistory();
        }

        updateUI();
    }

    @Override
    public boolean onLongClick(View v) {
        return false;
    }

    private void updateUI() {
        if (tvDisplay != null) {
            tvDisplay.setText(calc.getCurrentValue());
        }
        if (tvOperator != null) {
            String op = calc.getOperator();
            tvOperator.setText(op);
            tvOperator.setVisibility(op.isEmpty() ? View.GONE : View.VISIBLE);
        }
    }

    private void saveHistory() {
        List<String> list = calc.getHistoryList();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(";;;");
            sb.append(list.get(i));
        }
        prefs.edit().putString(PREF_HISTORY, sb.toString()).apply();
    }

    private void cycleTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % THEME_NAMES.length;
        prefs.edit().putInt(PREF_THEME, currentThemeIndex).apply();
        applyTheme(currentThemeIndex, true);
    }

    private void applyTheme(int themeIdx, boolean showToast) {
        triggerHaptic(null);

        int rootBg, displayBg, displayStroke;
        int textMain, opAccentColor;
        int numBg, numText;
        int funcBg, funcText;
        int opBg, opText;
        int eqBg, eqText;
        Typeface typeface = Typeface.DEFAULT;

        switch (themeIdx) {
            case 1: // Vintage 80s LCD
                rootBg = Color.parseColor("#2b2e30");
                displayBg = Color.parseColor("#9ea98a");
                displayStroke = Color.parseColor("#7d876a");
                textMain = Color.parseColor("#192211");
                opAccentColor = Color.parseColor("#3d4349");
                numBg = Color.parseColor("#ece8de");
                numText = Color.parseColor("#192211");
                funcBg = Color.parseColor("#c5beaf");
                funcText = Color.parseColor("#192211");
                opBg = Color.parseColor("#3d4349");
                opText = Color.parseColor("#ffffff");
                eqBg = Color.parseColor("#d9532f");
                eqText = Color.parseColor("#ffffff");
                typeface = Typeface.MONOSPACE;
                break;

            case 2: // Cyberpunk Neon
                rootBg = Color.parseColor("#090514");
                displayBg = Color.parseColor("#0d071d");
                displayStroke = Color.parseColor("#a855f7");
                textMain = Color.parseColor("#00f0ff");
                opAccentColor = Color.parseColor("#ff007f");
                numBg = Color.parseColor("#251347");
                numText = Color.parseColor("#ffffff");
                funcBg = Color.parseColor("#3b186b");
                funcText = Color.parseColor("#c084fc");
                opBg = Color.parseColor("#ff007f");
                opText = Color.parseColor("#ffffff");
                eqBg = Color.parseColor("#ffd600");
                eqText = Color.parseColor("#12052b");
                break;

            case 3: // Modern Light
                rootBg = Color.parseColor("#f1f3f9");
                displayBg = Color.parseColor("#ffffff");
                displayStroke = Color.parseColor("#d1d5db");
                textMain = Color.parseColor("#1f2937");
                opAccentColor = Color.parseColor("#6366f1");
                numBg = Color.parseColor("#e5e7eb");
                numText = Color.parseColor("#1f2937");
                funcBg = Color.parseColor("#d1d5db");
                funcText = Color.parseColor("#1f2937");
                opBg = Color.parseColor("#6366f1");
                opText = Color.parseColor("#ffffff");
                eqBg = Color.parseColor("#0284c7");
                eqText = Color.parseColor("#ffffff");
                break;

            default: // OLED Midnight (0)
                rootBg = Color.parseColor("#000000");
                displayBg = Color.parseColor("#111318");
                displayStroke = Color.parseColor("#2b3040");
                textMain = Color.parseColor("#ffffff");
                opAccentColor = Color.parseColor("#ff6b00");
                numBg = Color.parseColor("#232634");
                numText = Color.parseColor("#ffffff");
                funcBg = Color.parseColor("#363a4f");
                funcText = Color.parseColor("#ffffff");
                opBg = Color.parseColor("#ff6b00");
                opText = Color.parseColor("#ffffff");
                eqBg = Color.parseColor("#06b6d4");
                eqText = Color.parseColor("#ffffff");
                break;
        }

        if (layoutRoot != null) layoutRoot.setBackgroundColor(rootBg);

        if (layoutDisplay != null) {
            GradientDrawable gd = new GradientDrawable();
            gd.setColor(displayBg);
            gd.setCornerRadius(dpToPx(14));
            gd.setStroke(dpToPx(1), displayStroke);
            layoutDisplay.setBackground(gd);
        }

        if (tvDisplay != null) {
            tvDisplay.setTextColor(textMain);
            tvDisplay.setTypeface(typeface, Typeface.BOLD);
        }
        if (tvOperator != null) {
            tvOperator.setTextColor(opAccentColor);
            tvOperator.setTypeface(typeface, Typeface.BOLD);
        }

        applyButtonStyles(numButtons, numBg, numText);
        applyButtonStyles(funcButtons, funcBg, funcText);
        applyButtonStyles(opButtons, opBg, opText);
        if (btnEquals != null) {
            applySingleButton(btnEquals, eqBg, eqText);
        }

        if (showToast) {
            Toast.makeText(this, "Theme: " + THEME_NAMES[themeIdx], Toast.LENGTH_SHORT).show();
        }
    }

    private void applyButtonStyles(List<Button> buttons, int bgColor, int textColor) {
        for (Button btn : buttons) {
            applySingleButton(btn, bgColor, textColor);
        }
    }

    private void applySingleButton(Button btn, int bgColor, int textColor) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(bgColor);
        shape.setCornerRadius(dpToPx(10));
        btn.setBackground(shape);
        btn.setTextColor(textColor);
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }

    private void showHistoryDialog() {
        List<String> history = calc.getHistoryList();
        if (history.isEmpty()) {
            Toast.makeText(this, "No history yet", Toast.LENGTH_SHORT).show();
            return;
        }

        Dialog dialog = new Dialog(this, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setContentView(R.layout.dialog_history);
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));
        }

        ListView lvHistory = dialog.findViewById(R.id.lvHistory);
        Button btnClear = dialog.findViewById(R.id.btnHistoryClear);
        Button btnClose = dialog.findViewById(R.id.btnHistoryClose);

        HistoryAdapter adapter = new HistoryAdapter(this, history);
        if (lvHistory != null) {
            lvHistory.setAdapter(adapter);
            lvHistory.setOnItemClickListener((parent, view, position, id) -> {
                String selected = history.get(position);
                String[] parts = selected.split("=");
                String res = parts.length > 1 ? parts[1].trim() : parts[0].trim();
                calc.clearAll();
                for (char c : res.toCharArray()) {
                    if (c >= '0' && c <= '9') calc.inputDigit(String.valueOf(c));
                    else if (c == '.') calc.inputDecimal();
                    else if (c == '-') calc.toggleSign();
                }
                updateUI();
                dialog.dismiss();
                Toast.makeText(this, "Loaded: " + res, Toast.LENGTH_SHORT).show();
            });
        }

        if (btnClear != null) {
            btnClear.setOnClickListener(v -> {
                calc.clearHistory();
                saveHistory();
                dialog.dismiss();
                Toast.makeText(this, "History cleared", Toast.LENGTH_SHORT).show();
            });
        }

        if (btnClose != null) {
            btnClose.setOnClickListener(v -> dialog.dismiss());
        }

        dialog.show();
    }

    private class HistoryAdapter extends ArrayAdapter<String> {
        public HistoryAdapter(Context context, List<String> list) {
            super(context, 0, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_history, parent, false);
            }
            String item = getItem(position);
            TextView itemEq = convertView.findViewById(R.id.itemEq);
            TextView itemRes = convertView.findViewById(R.id.itemRes);

            if (item != null) {
                String[] parts = item.split("=");
                String eq = parts.length > 1 ? parts[0].trim() + " =" : item;
                String res = parts.length > 1 ? parts[1].trim() : "";
                if (itemEq != null) itemEq.setText(eq);
                if (itemRes != null) itemRes.setText(res);
            }
            return convertView;
        }
    }

    private void triggerHaptic(View view) {
        if (view != null) {
            view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
        }
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(12);
            }
        }
    }
}
