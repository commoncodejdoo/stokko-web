import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  articlesService,
  CreateArticlePayload,
  ListArticlesParams,
  UpdateArticlePayload,
} from '@/domain/articles';

const KEY = ['articles'] as const;

export function useArticles(params?: ListArticlesParams) {
  return useQuery({
    queryKey: [...KEY, params ?? {}],
    queryFn: () => articlesService.list(params),
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => articlesService.findById(id!),
    enabled: !!id,
  });
}

export function useArticleHistory(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id, 'history'],
    queryFn: () => articlesService.getHistory(id!),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => articlesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArticlePayload }) =>
      articlesService.update(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articlesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
