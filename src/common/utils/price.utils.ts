/**
 * Calcule le montant total d'une commande
 * @param items Liste des items avec quantité
 * @param products Liste des produits depuis la DB
 * @returns Le montant total
 */
export function calculateTotal(
  items: { productId: string; quantity: number }[],
  products: { id: string; price: number }[],
): number {
  return items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
}

/**
 * Calcule le montant d'un item seul
 * @param price Prix unitaire
 * @param quantity Quantité
 * @returns Le montant
 */
export function calculateItemTotal(price: number, quantity: number): number {
  return price * quantity;
}

/**
 * Arrondi un montant à 2 décimales
 * @param amount Montant brut
 * @returns Montant arrondi
 */
export function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}