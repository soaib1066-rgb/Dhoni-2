package com.bangla.dhonihobar.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bangla.dhonihobar.viewmodel.GameViewModel

@Composable
fun DhonihobarApp(viewModel: GameViewModel = viewModel()) {
    val state by viewModel.gameState.collectAsState()

    if (state.gameMode == null) {
        HomeScreen(
            onStartBot = { viewModel.startBotGame() },
            onStartMultiplayer = { count -> viewModel.startMultiplayerGame(count) }
        )
    } else {
        BoardScreen(
            state = state,
            onRollDice = { viewModel.rollDice() },
            onBuyProperty = { viewModel.buyProperty() },
            onPassProperty = { viewModel.passProperty() },
            onPayFine = { viewModel.payJailFine() },
            onWaitTurn = { viewModel.waitJailTurn() },
            onDismissChance = {
                state.activeChanceCard?.let { viewModel.executeChanceCard(it) }
            },
            onRestart = {
                if (state.gameMode == "bot") {
                    viewModel.startBotGame()
                } else {
                    viewModel.startMultiplayerGame(state.players.size)
                }
            },
            onGoHome = { viewModel.resetToHome() }
        )
    }
}
