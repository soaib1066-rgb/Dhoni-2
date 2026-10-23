package com.bangla.dhonihobar.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bangla.dhonihobar.model.BoardTile
import com.bangla.dhonihobar.model.ChanceCard
import com.bangla.dhonihobar.model.Player
import com.bangla.dhonihobar.ui.theme.*
import com.bangla.dhonihobar.util.BanglaFormatter

@Composable
fun PropertyPurchaseDialog(
    tile: BoardTile?,
    player: Player?,
    onBuy: () -> Unit,
    onPass: () -> Unit
) {
    if (tile == null || player == null) return
    val canAfford = player.balance >= tile.cost

    AlertDialog(
        onDismissRequest = onPass,
        title = {
            Text(text = "জমি ক্রয়: ${tile.name}", color = GoldAccent, fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = tile.description, color = TextLight, fontSize = 14.sp)
                Text(text = "মূল্য: ${BanglaFormatter.formatBanglaTaka(tile.cost)}", color = EmeraldPrimary, fontWeight = FontWeight.Bold)
                Text(text = "ভাড়া: ${BanglaFormatter.formatBanglaTaka(tile.rent)}", color = TextMuted)
                Text(text = "আপনার ব্যালেন্স: ${BanglaFormatter.formatBanglaTaka(player.balance)}", color = TextLight)
                if (!canAfford) {
                    Text(text = "পর্যাপ্ত টাকা নেই!", color = PlayerRed, fontWeight = FontWeight.Bold)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onBuy,
                enabled = canAfford,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text(text = "কিনুন", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onPass) {
                Text(text = "পাস করুন", color = TextMuted)
            }
        },
        containerColor = SlateSurface,
        shape = RoundedCornerShape(20.dp)
    )
}

@Composable
fun ChanceCardDialog(
    card: ChanceCard?,
    onDismiss: () -> Unit
) {
    if (card == null) return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = "ভাগ্য পরীক্ষা", color = GoldAccent, fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = card.title, color = TextLight, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(text = card.description, color = TextMuted)
                if (card.amountEffect != 0) {
                    val color = if (card.amountEffect > 0) EmeraldPrimary else PlayerRed
                    val prefix = if (card.amountEffect > 0) "+" else ""
                    Text(
                        text = "প্রভাব: $prefix${BanglaFormatter.formatBanglaTaka(card.amountEffect)}",
                        color = color,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = GoldAccent)
            ) {
                Text(text = "কার্যকর করুন", color = SlateBackground, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = SlateSurface,
        shape = RoundedCornerShape(20.dp)
    )
}

@Composable
fun JailDialog(
    player: Player?,
    onPayFine: () -> Unit,
    onWait: () -> Unit
) {
    if (player == null) return
    val canAfford = player.balance >= 1000

    AlertDialog(
        onDismissRequest = onWait,
        title = {
            Text(text = "জেলখানা", color = PlayerRed, fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = "${player.name} জেলখানায় আটকে আছেন!", color = TextLight)
                Text(text = "৳১,০০০ জরিমানা দিয়ে বের হবেন নাকি ১ টার্ন অপেক্ষা করবেন?", color = TextMuted)
            }
        },
        confirmButton = {
            Button(
                onClick = onPayFine,
                enabled = canAfford,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text(text = "৳১,০০০ জরিমানা দিন", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onWait) {
                Text(text = "১ টার্ন অপেক্ষা", color = TextMuted)
            }
        },
        containerColor = SlateSurface,
        shape = RoundedCornerShape(20.dp)
    )
}

@Composable
fun WinnerDialog(
    winner: Player?,
    onRestart: () -> Unit
) {
    if (winner == null) return

    AlertDialog(
        onDismissRequest = {},
        title = {
            Text(text = "অভিনন্দন! বিজয়ী", color = GoldAccent, fontWeight = FontWeight.Black)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "${winner.name} সবচেয়ে ধনী হয়েছেন!",
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = "চূড়ান্ত নগদ: ${BanglaFormatter.formatBanglaTaka(winner.balance)}",
                    color = EmeraldPrimary,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onRestart,
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text(text = "আবার খেলুন", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = SlateSurface,
        shape = RoundedCornerShape(24.dp)
    )
}
