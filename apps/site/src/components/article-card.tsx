// Article card: image slot, category, title, excerpt and date. Implements: T-WEB-06, T-WEB-12,
// FR-WEB-INF-003.
import type { Article } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { localize } from '../content/localize';
import { useTranslations } from 'next-intl';
import { formatLongDate } from '../i18n/clock';
import { Link } from '../i18n/navigation';
import { ImageSlot } from './image-slot';

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const t = useTranslations();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-panel border border-border bg-surface">
      <ImageSlot image={article.image} locale={locale} ratio="wide" icon="newspaper" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-ui text-xs font-medium text-primary">
          {localize(article.category, locale)}
        </p>
        <h3 className="text-lg font-semibold">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary">
            {localize(article.title, locale)}
          </Link>
        </h3>
        <p className="text-sm text-text-muted">{localize(article.excerpt, locale)}</p>
        <p className="mt-auto pt-2 font-ui text-xs text-text-muted">
          <time dateTime={article.publishedOn}>
            {formatLongDate(t, article.publishedOn, locale)}
          </time>
        </p>
      </div>
    </article>
  );
}
