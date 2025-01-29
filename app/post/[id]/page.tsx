import { getPostWithFavorites } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getAuthorDisplayName } from "@/lib/utils/user";
import { formatDate } from "@/lib/utils/date";
import { ErrorMessage } from "@/components/error-message";
import { FavoriteButton } from "@/components/favorite-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type PostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const post = await getPostWithFavorites(resolvedParams.id, userId);

  if (!post) {
    return (
      <div className="container max-w-2xl mx-auto mt-16">
        <ErrorMessage
          title="Post Not Available"
          message="This post either does not exist or is private."
        />
      </div>
    );
  }

  const isAuthor = userId === post.authorId;
  const authorName = isAuthor
    ? "You"
    : post.author
    ? getAuthorDisplayName(post.author)
    : "Unknown";

  return (
    <article className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold mt-8">{post.title}</h1>
        <div className="flex items-center gap-2">
          <FavoriteButton post={post} />
          {isAuthor && (
            <>
              <Link href={`/edit/${post.id}`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        {authorName && (
          <>
            <span>
              By{" "}
              <span className="font-medium text-foreground">{authorName}</span>
            </span>
            <span>•</span>
          </>
        )}
        <time dateTime={post.createdAt.toISOString()}>
          {formatDate(post.createdAt)}
        </time>
        {post.isPrivate && (
          <>
            <span>•</span>
            <span className="font-semibold italic flex items-center gap-1">
              <Lock className="h-4 w-4 text-blue-600 dark:text-yellow-500" />
              Private
            </span>
          </>
        )}
      </div>

      <div className="prose max-w-none dark:prose-invert">
        {post.content.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
