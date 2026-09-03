import type { Order } from './order'
import { bikeDisplayName } from './parse'

export function smsPrzyjecieBody(entry: Order) {
  const rower = bikeDisplayName(entry.marka, entry.model)
  const termin = entry.termin || ''
  return rower + ' - przyjęto na serwis.'
    + (termin ? '\nWstępna data naprawy: ' + termin : '')
    + '\nPo zakończeniu naprawy otrzymasz SMS z kodem odbioru. Serwis'
}

export function smsWydanieBody(entry: Order) {
  if (entry.cr) {
    return 'Dzień dobry,\n'
      + 'Zamawiany rower jest już przygotowany do odbioru.\n'
      + 'Kod odbioru: ' + (entry.kodOdbioru || '–') + '\n'
      + 'Kwota do zapłaty: ' + (entry.total ?? '–') + '\n\n'
      + 'Przed odbiorem prosimy zapoznać się z krótką informacją\n'
      + 'www.rowpol.pl/info\n\n'
      + 'Zapraszamy!\n'
      + 'Serwis ROW-POL'
  }
  const rower = bikeDisplayName(entry.marka, entry.model)
  return rower + ' - przygotowany do odbioru\n\nGodziny otwarcia\nPn-pt 10:00-18:00\nSobota 9:00-14:00\n\nKwota do zapłaty - '
    + entry.total + ' zł\nPłatność gotówka/karta/BLIK\n\nKod odbioru: ' + (entry.kodOdbioru || '–')
}

export function smsHref(tel: string | undefined, body: string) {
  const n = String(tel || '').replace(/[^0-9+]/g, '')
  if (!n) return null
  return `sms:${n}?body=${encodeURIComponent(body)}`
}
