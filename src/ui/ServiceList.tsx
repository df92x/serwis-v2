import type { OrderItem, OrderSub } from '../domain/order'

type Props = {
  items: OrderItem[]
  subs: OrderSub[]
  onItems: (items: OrderItem[]) => void
  onSubs: (subs: OrderSub[]) => void
}

export function ServiceList({ items, subs, onItems, onSubs }: Props) {
  function toggle(name: string) {
    onItems(items.map(it => it.name === name ? { ...it, checked: !it.checked } : it))
  }
  function setPrice(name: string, price: number) {
    onItems(items.map(it => it.name === name ? { ...it, price, checked: it.checked || price > 0 } : it))
  }
  function setSub(i: number, patch: Partial<OrderSub>) {
    onSubs(subs.map((s, idx) => idx === i ? { ...s, ...patch, checked: patch.checked ?? (Number(patch.price) > 0 || !!s.checked) } : s))
  }

  return (
    <>
      <h2 className="list-h">Usługi</h2>
      <ul className="svc-list">
        {items.map(it => (
          <li key={it.name}>
            <label className="svc-row">
              <input type="checkbox" checked={it.checked} onChange={() => toggle(it.name)} />
              <span>{it.name}{it.customName ? ` — ${it.customName}` : ''}</span>
              <input
                className="price"
                inputMode="decimal"
                value={it.price || ''}
                onChange={e => setPrice(it.name, Number(e.target.value.replace(',', '.')) || 0)}
              />
            </label>
          </li>
        ))}
      </ul>
      <h2 className="list-h">Inne części</h2>
      <ul className="svc-list">
        {subs.map((s, i) => (
          <li key={i}>
            <label className="svc-row sub">
              <input
                placeholder={i === 0 ? 'Części koło' : i === 1 ? 'Łożyska' : 'Nazwa'}
                value={s.name}
                onChange={e => setSub(i, { name: e.target.value, checked: !!e.target.value || s.checked })}
              />
              <input
                className="price"
                inputMode="decimal"
                value={s.price || ''}
                onChange={e => setSub(i, { price: Number(e.target.value.replace(',', '.')) || 0 })}
              />
            </label>
          </li>
        ))}
      </ul>
    </>
  )
}
